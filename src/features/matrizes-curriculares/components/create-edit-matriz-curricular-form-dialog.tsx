import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HeaderIconContainer } from "@/components/icon-container"
import { BookOpenCheck as BookOpenCheckIcon, PenSquare } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  getMatrizesCurricularesControllerFindMatrizesDoCoordenadorQueryKey,
  useMatrizesCurricularesControllerCreate,
  useMatrizesCurricularesControllerFindMatrizesDoCoordenador,
  useMatrizesCurricularesControllerUpdate,
} from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { matrizesCurricularesControllerCreateBody } from "@/api-generated/zod-schemas/matrizes-curriculares/matrizes-curriculares"
import { useDisciplinasControllerFindAll } from "@/api-generated/client/disciplinas/disciplinas"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Schema de validação para o formulário de matriz curricular
 * Remove o campo idCurso pois será identificado automaticamente pelo backend
 */
const formSchema = matrizesCurricularesControllerCreateBody.pick({
  nome: true,
  disciplinasIds: true,
})

/**
 * Tipo para os dados do formulário
 */
type FormData = z.infer<typeof formSchema>

/**
 * Propriedades para o diálogo de criação/edição de matriz curricular
 */
interface CreateEditMatrizCurricularFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matrizCurricularId?: string
}

/**
 * Componente de diálogo para criar ou editar matrizes curriculares
 */
export function CreateEditMatrizCurricularFormDialog({
  open,
  onOpenChange,
  matrizCurricularId,
}: CreateEditMatrizCurricularFormDialogProps) {
  const isEditMode = !!matrizCurricularId
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([])
  const [commandOpen, setCommandOpen] = useState(false)
  const { data: disciplinasData } = useDisciplinasControllerFindAll()
  const { data: matrizCurricularData } =
    useMatrizesCurricularesControllerFindMatrizesDoCoordenador()

  const { mutate: createMatrizCurricular } =
    useMatrizesCurricularesControllerCreate()
  const { mutate: updateMatrizCurricular } =
    useMatrizesCurricularesControllerUpdate()
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      disciplinasIds: [],
    },
  })

  // Carrega os dados da matriz curricular quando estiver em modo de edição
  useEffect(() => {
    if (isEditMode && matrizCurricularData) {
      const matrizCurricular = matrizCurricularData.find(
        (mc) => mc.id === matrizCurricularId,
      )

      if (!matrizCurricular) return

      const { nome, disciplinas } = matrizCurricular

      form.reset({
        nome,
        disciplinasIds: disciplinas.map((d) => d.id),
      })

      setSelectedDisciplinas(disciplinas.map((d) => d.id))
    }
  }, [isEditMode, matrizCurricularData, form, matrizCurricularId])

  /**
   * Manipula o envio do formulário
   */
  function onSubmit(data: FormData) {
    if (isEditMode) {
      updateMatrizCurricular(
        {
          id: matrizCurricularId,
          data: {
            nome: data.nome,
            disciplinasIds: data.disciplinasIds,
          },
        },
        {
          onSuccess: () => {
            console.log("Matriz curricular atualizada com sucesso")
            toast.success(`A matriz curricular "${data.nome}" foi atualizada.`)
            // Invalidar cache das matrizes do coordenador
            queryClient.invalidateQueries({
              queryKey:
                getMatrizesCurricularesControllerFindMatrizesDoCoordenadorQueryKey(),
            })
            onOpenChange(false)
            form.reset()
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message ||
                "Erro ao atualizar matriz curricular",
            )
          },
        },
      )
    } else {
      createMatrizCurricular(
        {
          data: {
            nome: data.nome,
            disciplinasIds: data.disciplinasIds,
          },
        },
        {
          onSuccess: () => {
            toast.success(
              `A matriz curricular "${data.nome}" foi criada para o seu curso.`,
            )
            // Invalidar cache das matrizes do coordenador
            queryClient.invalidateQueries({
              queryKey:
                getMatrizesCurricularesControllerFindMatrizesDoCoordenadorQueryKey(),
            })
            onOpenChange(false)
            form.reset()
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "Erro ao criar matriz curricular",
            )
          },
        },
      )
    }
  }

  /**
   * Manipula a seleção ou deseleção de uma disciplina
   */
  function handleToggleDisciplina(disciplinaId: string) {
    const currentDisciplinas = form.getValues("disciplinasIds")
    let newDisciplinas: string[]

    if (currentDisciplinas.includes(disciplinaId)) {
      newDisciplinas = currentDisciplinas.filter((id) => id !== disciplinaId)
    } else {
      newDisciplinas = [...currentDisciplinas, disciplinaId]
    }

    form.setValue("disciplinasIds", newDisciplinas, { shouldValidate: true })
    setSelectedDisciplinas(newDisciplinas)
  }

  /**
   * Renderiza as disciplinas selecionadas
   */
  function renderSelectedDisciplinas() {
    if (!selectedDisciplinas.length) return null

    const selectedDisciplinasData =
      disciplinasData?.filter((d) => selectedDisciplinas.includes(d.id)) || []

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedDisciplinasData.map((disciplina) => (
          <Badge
            key={disciplina.id}
            variant="secondary"
            className="text-sm"
          >
            {disciplina.nome}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8 sm:max-w-[500px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer
            Icon={isEditMode ? PenSquare : BookOpenCheckIcon}
          />
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Editar Matriz Curricular" : "Nova Matriz Curricular"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ?
                "Edite os dados da matriz curricular existente."
              : "Preencha os campos para criar uma nova matriz curricular. O curso será identificado automaticamente."
              }
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
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da matriz curricular"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disciplinasIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disciplinas</FormLabel>
                  <Popover
                    open={commandOpen}
                    onOpenChange={setCommandOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value.length && "text-muted-foreground",
                          )}
                        >
                          {field.value.length ?
                            `${field.value.length} disciplina(s) selecionada(s)`
                          : "Selecione as disciplinas"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Buscar disciplina..." />
                        <CommandList>
                          <CommandEmpty>
                            Nenhuma disciplina encontrada.
                          </CommandEmpty>
                          <ScrollArea className="h-[300px]">
                            <CommandGroup>
                              {disciplinasData?.map((disciplina) => (
                                <CommandItem
                                  key={disciplina.id}
                                  value={disciplina.id}
                                  onSelect={() =>
                                    handleToggleDisciplina(disciplina.id)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value.includes(disciplina.id) ?
                                        "opacity-100"
                                      : "opacity-0",
                                    )}
                                  />
                                  {disciplina.nome}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {renderSelectedDisciplinas()}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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
                  isEditMode ?
                    "Salvando..."
                  : "Criando..."
                : isEditMode ?
                  "Salvar"
                : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
