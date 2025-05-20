import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
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
  useMatrizesCurricularesControllerCreate,
  useMatrizesCurricularesControllerFindAll,
  useMatrizesCurricularesControllerUpdate,
} from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCursosControllerFindAll } from "@/api-generated/client/cursos/cursos"
import { ScrollArea } from "@/components/ui/scroll-area"
// Dados mockados para as disciplinas enquanto o módulo de disciplinas não é implementado
const DISCIPLINAS_MOCK = [
  { id: "1", nome: "Cálculo I", codigo: "MAT101", cargaHoraria: 60 },
  {
    id: "2",
    nome: "Programação Orientada a Objetos",
    codigo: "INF201",
    cargaHoraria: 80,
  },
  { id: "3", nome: "Banco de Dados", codigo: "INF301", cargaHoraria: 60 },
  { id: "4", nome: "Estrutura de Dados", codigo: "INF202", cargaHoraria: 80 },
  {
    id: "5",
    nome: "Inteligência Artificial",
    codigo: "INF401",
    cargaHoraria: 60,
  },
  { id: "6", nome: "Engenharia de Software", codigo: "INF302", cargaHoraria: 80 },
  { id: "7", nome: "Redes de Computadores", codigo: "INF303", cargaHoraria: 60 },
  { id: "8", nome: "Sistemas Operacionais", codigo: "INF304", cargaHoraria: 60 },
  { id: "9", nome: "Computação Gráfica", codigo: "INF402", cargaHoraria: 60 },
  { id: "10", nome: "Desenvolvimento Web", codigo: "INF403", cargaHoraria: 80 },
]
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

/**
 * Schema de validação para o formulário de matriz curricular
 */
const formSchema = matrizesCurricularesControllerCreateBody.pick({
  nome: true,
  idCurso: true,
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([])
  const [commandOpen, setCommandOpen] = useState(false)

  const { toast } = useToast()
  const { data: cursosData } = useCursosControllerFindAll({})
  // Usando os dados mockados ao invés de chamar a API
  const disciplinasData = { data: DISCIPLINAS_MOCK }
  const { data: matrizCurricularData } = useMatrizesCurricularesControllerFindAll(
    {},
  )

  const { mutateAsync: createMatrizCurricular } =
    useMatrizesCurricularesControllerCreate()
  const { mutateAsync: updateMatrizCurricular } =
    useMatrizesCurricularesControllerUpdate()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      idCurso: "",
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

      const { nome, idCurso, disciplinas } = matrizCurricular

      form.reset({
        nome,
        idCurso,
        disciplinasIds: disciplinas.map((d) => d.id),
      })

      setSelectedDisciplinas(disciplinas.map((d) => d.id))
    }
  }, [isEditMode, matrizCurricularData, form, matrizCurricularId])

  /**
   * Manipula o envio do formulário
   */
  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true)

      if (isEditMode) {
        await updateMatrizCurricular({
          id: matrizCurricularId,
          data: {
            nome: data.nome,
            idCurso: data.idCurso,
            disciplinasIds: data.disciplinasIds,
          },
        })

        toast({
          title: "Matriz curricular atualizada com sucesso",
          description: `A matriz curricular "${data.nome}" foi atualizada.`,
        })
      } else {
        await createMatrizCurricular({
          data: {
            nome: data.nome,
            idCurso: data.idCurso,
            disciplinasIds: data.disciplinasIds,
          },
        })

        toast({
          title: "Matriz curricular criada com sucesso",
          description: `A matriz curricular "${data.nome}" foi criada.`,
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar matriz curricular:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar matriz curricular",
        description:
          "Ocorreu um erro ao tentar salvar a matriz curricular. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
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

  function renderSelectedDisciplinas() {
    if (!selectedDisciplinas.length) return null

    const selectedDisciplinasData =
      disciplinasData?.data?.filter((d) => selectedDisciplinas.includes(d.id)) ||
      []

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
              : "Preencha os campos para criar uma nova matriz curricular."}
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
              name="idCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cursosData?.map((curso) => (
                        <SelectItem
                          key={curso.id}
                          value={curso.id}
                        >
                          {curso.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                              {disciplinasData?.data?.map((disciplina) => (
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
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ?
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
