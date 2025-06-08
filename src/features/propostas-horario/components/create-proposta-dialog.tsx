import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CalendarDays, Loader2, Plus } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { toast } from "sonner"

import { useCursosControllerFindAll } from "@/api-generated/client/cursos/cursos"
import { usePeriodosLetivosControllerFindAll } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import {
  createPropostaFormSchema,
  type CreatePropostaFormData,
} from "../schemas/proposta-schemas"
import {
  useCreateProposta,
  usePropostasHorarioList,
} from "../hooks/use-propostas-horario"
import { useAuth } from "@/features/auth/contexts/auth-context"

interface CreatePropostaDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog para criação de nova proposta de horário
 * Permite seleção de curso, período letivo e observações
 */
export function CreatePropostaDialog({
  isOpen,
  onOpenChange,
}: CreatePropostaDialogProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Hooks da API
  const { mutate: createProposta, isPending: isCreating } = useCreateProposta()

  const { data: cursos = [], isLoading: isLoadingCursos } =
    useCursosControllerFindAll()

  const { data: periodosLetivos = [], isLoading: isLoadingPeriodos } =
    usePeriodosLetivosControllerFindAll()

  const { data: propostas = [], isLoading: isLoadingPropostas } =
    usePropostasHorarioList()

  // Configuração do formulário
  const form = useForm<CreatePropostaFormData>({
    resolver: zodResolver(createPropostaFormSchema),
    defaultValues: {
      idCurso: "",
      idPeriodoLetivo: "",
      observacoesCoordenador: "",
    },
  })

  // Reset do formulário quando o dialog abre/fecha
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  // Função para verificar se já existe proposta para a combinação curso + período
  const verificarPropostaDuplicada = (
    idCurso: string,
    idPeriodoLetivo: string,
  ) => {
    return propostas.find(
      (proposta) =>
        proposta.curso.id === idCurso &&
        proposta.periodoLetivo.id === idPeriodoLetivo &&
        (proposta.status === "DRAFT" || proposta.status === "PENDENTE_APROVACAO"),
    )
  }

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: CreatePropostaFormData) => {
    // Verificar se já existe proposta para esta combinação
    const propostaExistente = verificarPropostaDuplicada(
      data.idCurso,
      data.idPeriodoLetivo,
    )

    if (propostaExistente) {
      const statusText =
        propostaExistente.status === "DRAFT" ?
          "em elaboração"
        : "pendente de aprovação"
      toast.error(
        `Já existe uma proposta ${statusText} para este curso e período letivo.`,
      )
      return
    }

    createProposta(
      { data },
      {
        onSuccess: (proposta) => {
          toast.success("Proposta criada com sucesso!")
          onOpenChange(false)
          // Redireciona para a página de edição da proposta criada
          navigate(`/coordenador/propostas-horario/${proposta.id}`)
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "Erro ao criar proposta"
          toast.error(errorMessage)
        },
      },
    )
  }

  // Filtra apenas períodos letivos ativos e vigentes (dentro das datas)
  const periodosAtivos = periodosLetivos.filter((periodo) => {
    // Primeiro, deve ter status ATIVO
    if (periodo.status !== "ATIVO") return false

    // Verificar se o período está vigente (pode criar propostas)
    const hoje = new Date()
    const dataInicio = new Date(periodo.dataInicio)
    const dataFim = new Date(periodo.dataFim)

    // Permitir criação de propostas se:
    // - O período já começou OU começará em até 30 dias
    // - O período ainda não terminou
    const diasAteInicio = Math.ceil(
      (dataInicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
    )
    const jaTerminou = dataFim.getTime() < hoje.getTime()

    return !jaTerminou && diasAteInicio <= 30
  })

  // Filtra cursos para mostrar apenas aqueles em que o coordenador logado é responsável
  const cursosDisponiveis = cursos.filter((curso) => {
    // Se não há coordenador principal definido, não mostrar o curso
    if (!curso.coordenadorPrincipal) return false

    // Verificar se o coordenador logado é o coordenador principal do curso
    return curso.coordenadorPrincipal.id === user?.id
  })

  // Ordena cursos disponíveis por nome
  const cursosOrdenados = [...cursosDisponiveis].sort((a, b) =>
    a.nome.localeCompare(b.nome),
  )

  // Ordena períodos por ano e semestre (mais recentes primeiro)
  const periodosOrdenados = [...periodosAtivos].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano
    return b.semestre - a.semestre
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8 sm:max-w-[500px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={Plus} />
          <div>
            <DialogTitle className="text-2xl font-bold">
              Nova Proposta de Horário
            </DialogTitle>
            <DialogDescription>
              Crie uma nova proposta de grade horária selecionando o curso e
              período letivo.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Seleção de Curso */}
            <FormField
              control={form.control}
              name="idCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCursos || isCreating}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um curso..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {isLoadingCursos ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando cursos...
                          </div>
                        </SelectItem>
                      : cursosOrdenados.length === 0 ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          Nenhum curso disponível para sua coordenação
                        </SelectItem>
                      : cursosOrdenados.map((curso) => {
                          const periodoSelecionado = form.watch("idPeriodoLetivo")
                          const temPropostaExistente =
                            periodoSelecionado &&
                            verificarPropostaDuplicada(
                              curso.id,
                              periodoSelecionado,
                            )

                          return (
                            <SelectItem
                              key={curso.id}
                              value={curso.id}
                              disabled={!!temPropostaExistente}
                            >
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {curso.nome}
                                  </span>
                                  {curso.codigo && (
                                    <span className="text-muted-foreground text-xs">
                                      {curso.codigo}
                                    </span>
                                  )}
                                </div>
                                {temPropostaExistente && (
                                  <span className="text-xs font-medium text-amber-600">
                                    Proposta existente
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })
                      }
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Apenas cursos sob sua coordenação são exibidos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seleção de Período Letivo */}
            <FormField
              control={form.control}
              name="idPeriodoLetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período Letivo *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPeriodos || isCreating}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um período letivo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {isLoadingPeriodos ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando períodos...
                          </div>
                        </SelectItem>
                      : periodosOrdenados.length === 0 ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          Nenhum período ativo disponível para criação de
                          propostas
                        </SelectItem>
                      : periodosOrdenados.map((periodo) => {
                          const hoje = new Date()
                          const dataInicio = new Date(periodo.dataInicio)
                          const dataFim = new Date(periodo.dataFim)
                          const diasAteInicio = Math.ceil(
                            (dataInicio.getTime() - hoje.getTime()) /
                              (1000 * 60 * 60 * 24),
                          )

                          let statusIndicator = ""
                          let statusColor = "text-muted-foreground"

                          if (diasAteInicio > 0) {
                            statusIndicator = `Inicia em ${diasAteInicio} dias`
                            statusColor = "text-primary"
                          } else if (dataFim.getTime() > hoje.getTime()) {
                            statusIndicator = "Em andamento"
                            statusColor = "text-accent-foreground"
                          }

                          const cursoSelecionado = form.watch("idCurso")
                          const temPropostaExistente =
                            cursoSelecionado &&
                            verificarPropostaDuplicada(
                              cursoSelecionado,
                              periodo.id,
                            )

                          return (
                            <SelectItem
                              key={periodo.id}
                              value={periodo.id}
                              disabled={!!temPropostaExistente}
                            >
                              <div className="flex w-full items-center justify-between gap-4">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {periodo.ano}/{periodo.semestre}º Semestre
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {new Date(
                                      periodo.dataInicio,
                                    ).toLocaleDateString("pt-BR")}{" "}
                                    -{" "}
                                    {new Date(periodo.dataFim).toLocaleDateString(
                                      "pt-BR",
                                    )}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {statusIndicator && (
                                    <span
                                      className={`text-xs font-medium ${statusColor}`}
                                    >
                                      {statusIndicator}
                                    </span>
                                  )}
                                  {temPropostaExistente && (
                                    <span className="text-xs font-medium text-amber-600">
                                      Proposta existente
                                    </span>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })
                      }
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o período letivo para o qual a proposta será criada.
                    Apenas períodos ativos e vigentes (que não terminaram e
                    começam em até 30 dias) são exibidos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações do Coordenador */}
            <FormField
              control={form.control}
              name="observacoesCoordenador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre esta proposta (opcional)..."
                      className="min-h-[100px] resize-none"
                      disabled={isCreating}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Campo opcional para adicionar observações sobre a proposta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isLoadingPropostas}
              >
                {isCreating ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                : isLoadingPropostas ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                : <>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Criar Proposta
                  </>
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
