import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GraduationCapIcon, Loader2, PenSquare, Save } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import {
  useCursosControllerCreate,
  useCursosControllerUpdate,
  getCursosControllerFindAllQueryKey,
} from "@/api-generated/client/cursos/cursos"
import { useUsuariosControllerFindAll } from "@/api-generated/client/usuarios/usuarios"
import type { CursoResponseDto, UsuarioResponseDto } from "@/api-generated/model"
import { UsuarioResponseDtoPapel } from "@/api-generated/model"
import {
  cursosControllerCreateBody,
  cursosControllerUpdateBody,
} from "@/api-generated/zod-schemas/cursos/cursos"
import { z } from "zod"
import { HeaderIconContainer } from "@/components/icon-container"
import type { AxiosError } from "axios"
import { toast } from "sonner"

// Tipos inferidos dos schemas
type CourseFormValues = z.infer<typeof cursosControllerCreateBody>
type CourseUpdateFormValues = z.infer<typeof cursosControllerUpdateBody>

interface CreateEditCourseFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  course?: CursoResponseDto
}

/**
 * Dialog para criação e edição de cursos
 */
export function CreateEditCourseFormDialog({
  isOpen,
  onOpenChange,
  course,
}: CreateEditCourseFormDialogProps) {
  // Hooks
  const { mutate: mutateUpdate, isPending: isUpdating } =
    useCursosControllerUpdate()
  const { mutate: mutateCreate, isPending: isCreating } =
    useCursosControllerCreate()
  const queryClient = useQueryClient()

  // Buscar lista de coordenadores para o select
  const { data: usersData, isLoading: isLoadingUsers } =
    useUsuariosControllerFindAll({
      papel: UsuarioResponseDtoPapel.COORDENADOR,
    })

  const [coordinators, setCoordinators] = useState<UsuarioResponseDto[]>([])

  // Estados
  const [isEditMode] = useState(!!course)
  const isPending = isCreating || isUpdating

  const schema =
    isEditMode ? cursosControllerUpdateBody : cursosControllerCreateBody

  // Configuração do formulário
  const form = useForm<CourseFormValues | CourseUpdateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      codigo: "",
      idCoordenador: "",
    },
  })

  // Carrega os dados do curso para edição
  useEffect(() => {
    if (isEditMode && course) {
      // Atualiza o formulário com os dados do curso existente
      form.reset({
        nome: course.nome || "",
        codigo: course.codigo || "",
        idCoordenador: course.coordenadorPrincipal?.id || "",
      })
    } else {
      // Reset do formulário para criação
      form.reset({
        nome: "",
        codigo: "",
        idCoordenador: "",
      })
    }

    // Limpa erros de validação
    form.clearErrors()
  }, [isEditMode, course, form])

  // Atualiza a lista de coordenadores quando os dados forem carregados
  useEffect(() => {
    if (usersData) {
      setCoordinators(usersData)
    }
  }, [usersData])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: CourseFormValues | CourseUpdateFormValues) => {
    if (isEditMode && course) {
      // Atualização de curso existente
      mutateUpdate(
        {
          id: course.id,
          data: data as CourseUpdateFormValues,
        },
        {
          onSuccess: () => {
            toast.success("Curso atualizado")
            queryClient.invalidateQueries({
              queryKey: getCursosControllerFindAllQueryKey(),
            })
            onOpenChange(false)
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message || "Erro ao atualizar curso"
            toast.error(errorMessage)
          },
        },
      )
    } else {
      // Criação de novo curso
      mutateCreate(
        { data: data as CourseFormValues },
        {
          onSuccess: () => {
            toast.success("Curso criado")
            queryClient.invalidateQueries({
              queryKey: getCursosControllerFindAllQueryKey(),
            })
            onOpenChange(false)
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message || "Erro ao criar curso"
            toast.error(errorMessage)
          },
        },
      )
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8 sm:max-w-[500px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer
            Icon={isEditMode ? PenSquare : GraduationCapIcon}
          />
          <div>
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Editar Curso" : "Novo Curso"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ?
                "Edite as informações do curso abaixo."
              : "Preencha as informações do curso abaixo."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Curso</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Engenharia de Software"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>O nome completo do curso.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Curso</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: ENG-SOFT"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O código único para identificar o curso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idCoordenador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordenador</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isPending || isLoadingUsers}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o coordenador" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ?
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Carregando coordenadores...</span>
                          </div>
                        : coordinators.length > 0 ?
                          coordinators.map((coord) => (
                            <SelectItem
                              key={coord.id}
                              value={coord.id}
                            >
                              {coord.nome}
                            </SelectItem>
                          ))
                        : <div className="text-muted-foreground p-2 text-center text-sm">
                            Nenhum coordenador disponível
                          </div>
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    O professor responsável pela coordenação deste curso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save />
                {isEditMode ? "Salvar Alterações" : "Criar Curso"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
