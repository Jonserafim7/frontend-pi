import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  useDisciplinasControllerCreate,
  useDisciplinasControllerUpdate,
  getDisciplinasControllerFindAllQueryKey,
} from "@/api-generated/client/disciplinas/disciplinas"
import {
  disciplinasControllerCreateBody,
  disciplinasControllerUpdateBody,
} from "@/api-generated/zod-schemas/disciplinas/disciplinas"
import type { DisciplinaResponseDto } from "@/api-generated/model/disciplina-response-dto"
import { useQueryClient } from "@tanstack/react-query"
import { HeaderIconContainer } from "@/components/icon-container"
import { Loader2, BookOpen, PenLine } from "lucide-react"
import type { AxiosError } from "axios"

// Tipos inferidos dos schemas
type CreateDisciplinaFormValues = z.infer<typeof disciplinasControllerCreateBody>
type UpdateDisciplinaFormValues = z.infer<typeof disciplinasControllerUpdateBody>

// Tipo união para o formulário
type DisciplinaFormValues =
  | CreateDisciplinaFormValues
  | UpdateDisciplinaFormValues

// Schemas de validação
const createDisciplinaSchema = disciplinasControllerCreateBody
const updateDisciplinaSchema = disciplinasControllerUpdateBody

interface CreateEditDisciplinaFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  disciplina?: DisciplinaResponseDto
}

/**
 * Componente de diálogo para criação/edição de disciplina
 */
export function CreateEditDisciplinaFormDialog({
  isOpen,
  onOpenChange,
  disciplina,
}: CreateEditDisciplinaFormDialogProps) {
  // Hooks
  const { toast } = useToast()
  const { mutate: mutateCreate } = useDisciplinasControllerCreate()
  const { mutate: mutateUpdate } = useDisciplinasControllerUpdate()
  const queryClient = useQueryClient()

  // Estados
  const [isEditMode] = useState(!!disciplina)

  // Configuração do formulário
  const form = useForm<DisciplinaFormValues>({
    resolver: zodResolver(
      isEditMode ? updateDisciplinaSchema : createDisciplinaSchema,
    ),
    defaultValues: {
      nome: "",
      codigo: "",
      cargaHoraria: 60,
    },
  })

  // Carrega os dados da disciplina para edição
  useEffect(() => {
    if (isEditMode && disciplina) {
      // Atualiza o formulário com os dados da disciplina existente
      form.reset({
        nome: disciplina.nome || "",
        codigo: disciplina.codigo || "",
        cargaHoraria: disciplina.cargaHoraria || 60,
      } as DisciplinaFormValues)
    } else if (!isEditMode) {
      // Reseta para os valores padrão no modo de criação
      form.reset({
        nome: "",
        codigo: "",
        cargaHoraria: 60,
      } as DisciplinaFormValues)
    }

    // Limpa erros de validação
    form.clearErrors()
  }, [isEditMode, disciplina, form])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: DisciplinaFormValues) => {
    if (isEditMode && disciplina) {
      // Na edição, enviamos apenas os campos fornecidos
      const updateData = data as UpdateDisciplinaFormValues

      mutateUpdate(
        {
          id: disciplina.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            toast({
              title: "Disciplina atualizada",
              description: "A disciplina foi atualizada com sucesso.",
            })
            queryClient.invalidateQueries({
              queryKey: getDisciplinasControllerFindAllQueryKey(),
            })
            onOpenChange(false)
          },
          onError: (error: AxiosError) => {
            toast({
              title: "Erro ao atualizar disciplina",
              description:
                error.request.message ||
                "Ocorreu um erro ao atualizar a disciplina.",
              variant: "destructive",
            })
          },
        },
      )
    } else {
      // No modo de criação
      const createData = data as CreateDisciplinaFormValues

      mutateCreate(
        { data: createData },
        {
          onSuccess: () => {
            toast({
              title: "Disciplina criada",
              description: "A disciplina foi criada com sucesso.",
            })
            queryClient.invalidateQueries({
              queryKey: getDisciplinasControllerFindAllQueryKey(),
            })
            onOpenChange(false)
          },
          onError: (error: AxiosError) => {
            toast({
              title: "Erro ao criar disciplina",
              description:
                error.request.response ||
                "Ocorreu um erro ao criar a disciplina.",
              variant: "destructive",
            })
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HeaderIconContainer Icon={isEditMode ? PenLine : BookOpen} />
            <div className="flex flex-col gap-1">
              <DialogTitle>
                {isEditMode ? "Editar Disciplina" : "Criar Disciplina"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ?
                  "Edite os campos abaixo para atualizar a disciplina."
                : "Preencha os campos abaixo para criar uma nova disciplina."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da disciplina"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Código da disciplina (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cargaHoraria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga Horária</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Botões de ação */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                : isEditMode ?
                  "Atualizar"
                : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
