import { useState, useCallback, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, AlertTriangle } from "lucide-react"
import {
  ScheduleGrid,
  TurmasListComponent,
  PropostasHorarioHeader,
  TurmasStatistics,
} from "../components"
import { TurmaSelectionProvider, useTurmaSelection } from "../contexts"
import { useDebounce } from "@/hooks/useDebounce"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import { usePeriodosLetivosControllerFindAll } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import { useAlocacoesHorariosControllerFindMany } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import { useValidateAlocacaoMutation } from "../hooks/useValidateAlocacaoMutation"
import { useCreateAlocacaoMutation } from "../hooks/useCreateAlocacaoMutation"
import { useDeleteAlocacaoMutation } from "../hooks/useDeleteAlocacaoMutation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type {
  ConfiguracaoHorarioDto,
  TurmaResponseDto,
  AlocacaoHorarioResponseDto,
  AlocacaoHorarioResponseDtoDiaDaSemana,
  ValidateAlocacaoDto,
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoResponseDtoDetails,
} from "@/api-generated/model"
import { useQueryClient } from "@tanstack/react-query"

// Componente para exibir detalhes da validação no toast
// Movido de TestSchedulePage.tsx
const ValidationDetailsList: React.FC<{
  details: ValidateAlocacaoResponseDtoDetails
}> = ({ details }) => {
  if (!details || Object.keys(details).length === 0) {
    return null
  }
  if (typeof details === "string") {
    return <p>{details}</p>
  }
  return (
    <ul className="list-disc pl-5 text-xs">
      {Object.entries(details).map(([key, value]) => (
        <li key={key}>
          <strong>{key}:</strong> {String(value)}
        </li>
      ))}
    </ul>
  )
}

/**
 * Componente interno que usa o contexto de seleção
 */
function PropostasHorarioContent() {
  const queryClient = useQueryClient()
  const { turmaSelecionada, selecionarTurma, limparSelecao } = useTurmaSelection()

  // Estados locais
  const [periodoLetivoSelecionado, setPeriodoLetivoSelecionado] =
    useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [alocacoesVisiveis, setAlocacoesVisiveis] = useState<
    AlocacaoHorarioResponseDto[]
  >([])
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string
    startTime: string
    endTime: string
    turno: string
  } | null>(null)
  const [errorSlot, setErrorSlot] = useState<{
    day: string
    startTime: string
    endTime: string
  } | null>(null)
  const [selectedAlocacaoOnGrid, setSelectedAlocacaoOnGrid] =
    useState<AlocacaoHorarioResponseDto | null>(null)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  // Buscar períodos letivos
  const { data: periodosLetivos } = usePeriodosLetivosControllerFindAll()

  // Buscar configuração de horário global (não específica por período)
  const { data: configuracaoHorario } = useConfiguracoesHorarioControllerGet({
    query: {
      enabled: !!periodoLetivoSelecionado,
    },
  })

  // Buscar turmas para o período selecionado
  const {
    data: turmas = [],
    isLoading: isLoadingTurmas,
    refetch: refetchTurmas,
  } = useTurmasControllerFindAll(
    {
      idPeriodoLetivo: periodoLetivoSelecionado || undefined,
    },
    {
      query: {
        enabled: !!periodoLetivoSelecionado,
        staleTime: 5 * 60 * 1000, // 5 minutos
      },
    },
  )

  // Buscar alocações para o período selecionado
  const { data: alocacoesDoPeriodo, isLoading: isLoadingAlocacoes } =
    useAlocacoesHorariosControllerFindMany(
      {
        idPeriodoLetivo: periodoLetivoSelecionado || undefined,
      },
      {
        query: {
          enabled: !!periodoLetivoSelecionado,
          staleTime: 5 * 60 * 1000,
        },
      },
    )

  // Efeito para atualizar alocacoesVisiveis quando alocacoesDoPeriodo mudar
  useEffect(() => {
    if (alocacoesDoPeriodo) {
      setAlocacoesVisiveis(alocacoesDoPeriodo)
    }
  }, [alocacoesDoPeriodo])

  // Efeito para limpar estados dependentes quando o período letivo mudar
  useEffect(() => {
    limparSelecao()
    setSelectedSlot(null)
    setSelectedAlocacaoOnGrid(null)
    setErrorSlot(null)
    setAlocacoesVisiveis([])
  }, [periodoLetivoSelecionado, limparSelecao])

  // Efeito para limpar seleções de slot/alocação quando a turma selecionada (do contexto) mudar
  useEffect(() => {
    setSelectedSlot(null)
    setSelectedAlocacaoOnGrid(null)
    // Não precisa limpar errorSlot aqui, pois pode ser relevante para a nova turma
    // ou uma tentativa de alocação falha anterior da nova turma.
  }, [turmaSelecionada]) // Depende da turmaSelecionada do contexto

  // Filtrar turmas baseado na busca (filtro local)
  const turmasFiltradas = turmas.filter((turma) => {
    if (!debouncedSearchTerm) return true

    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      turma.codigoDaTurma?.toLowerCase().includes(searchLower) ||
      turma.disciplinaOfertada?.disciplina?.nome
        ?.toLowerCase()
        .includes(searchLower) ||
      turma.professorAlocado?.nome?.toLowerCase().includes(searchLower)
    )
  })

  // Processar turmas para o formato de alocação
  const turmasParaAlocacao = turmasFiltradas.map(
    (
      turma,
    ): TurmaResponseDto & {
      statusAlocacao:
        | "nao-alocada"
        | "parcialmente-alocada"
        | "totalmente-alocada"
        | "conflito"
      aulasAlocadas: number
      totalAulas: number
      conflitos: string[]
      podeSerAlocada: boolean
      corStatus: "green" | "yellow" | "red" | "gray"
    } => ({
      ...turma,
      statusAlocacao: "nao-alocada", // TODO: Implementar lógica real
      aulasAlocadas: 0, // TODO: Calcular baseado nas alocações existentes
      totalAulas: turma.disciplinaOfertada?.disciplina?.cargaHoraria || 0,
      conflitos: [],
      podeSerAlocada: !!turma.professorAlocado,
      corStatus: "gray" as const,
    }),
  )

  // Calcular estatísticas
  const estatisticas = {
    total: turmasParaAlocacao.length,
    totalNaoAlocadas: turmasParaAlocacao.filter(
      (t) => t.statusAlocacao === "nao-alocada",
    ).length,
    totalParcialmenteAlocadas: turmasParaAlocacao.filter(
      (t) => t.statusAlocacao === "parcialmente-alocada",
    ).length,
    totalTotalmenteAlocadas: turmasParaAlocacao.filter(
      (t) => t.statusAlocacao === "totalmente-alocada",
    ).length,
  }

  // Hooks de Mutação
  const validateAlocacaoMutation = useValidateAlocacaoMutation()
  const createAlocacaoMutation = useCreateAlocacaoMutation()
  const deleteAlocacaoMutation = useDeleteAlocacaoMutation()

  const { isPending: isValidatingAlocacao } = validateAlocacaoMutation
  const { isPending: isCreatingAlocacao } = createAlocacaoMutation
  const { isPending: isDeletingAlocacao } = deleteAlocacaoMutation

  const handleSlotClick = useCallback(
    async (slotInfo: {
      day: string
      startTime: string
      endTime: string
      turno: string
    }) => {
      setSelectedSlot(slotInfo)
      setErrorSlot(null)

      if (!turmaSelecionada?.turma?.id) {
        toast.info("Nenhuma turma selecionada", {
          description: "Por favor, selecione uma turma da lista para alocar.",
        })
        return
      }

      if (!configuracaoHorario) {
        toast.error("Configuração de horário não carregada.")
        return
      }

      const validateDto: ValidateAlocacaoDto = {
        idTurma: turmaSelecionada.turma.id,
        diaDaSemana: slotInfo.day
          .toUpperCase()
          .replace("Ç", "C") as AlocacaoHorarioResponseDtoDiaDaSemana,
        horaInicio: slotInfo.startTime,
        horaFim: slotInfo.endTime,
      }

      try {
        const validationResult = await validateAlocacaoMutation.mutateAsync({
          data: validateDto,
        })

        if (!validationResult.valid) {
          toast.error(
            validationResult.error || "Conflito de alocação detectado",
            {
              description:
                validationResult.details ?
                  <ValidationDetailsList details={validationResult.details} />
                : validationResult.error ? undefined
                : "A turma não pode ser alocada neste horário.",
            },
          )
          setErrorSlot({
            day: slotInfo.day,
            startTime: slotInfo.startTime,
            endTime: slotInfo.endTime,
          })
          setTimeout(() => setErrorSlot(null), 3000)
          return
        }

        const createDto: CreateAlocacaoHorarioDto = {
          idTurma: turmaSelecionada.turma.id,
          diaDaSemana: slotInfo.day
            .toUpperCase()
            .replace("Ç", "C") as AlocacaoHorarioResponseDtoDiaDaSemana,
          horaInicio: slotInfo.startTime,
          horaFim: slotInfo.endTime,
        }

        await createAlocacaoMutation.mutateAsync(
          { data: createDto },
          {
            onSuccess: (novaAlocacao) => {
              toast.success("Turma alocada com sucesso!")
              setSelectedSlot(null)
              queryClient.invalidateQueries({
                queryKey: ["alocacoesHorariosControllerFindMany"],
              })
            },
            onError: (error) => {
              console.error("Erro ao alocar turma:", error)
              const errorMsg =
                error instanceof Error ?
                  error.message
                : "Ocorreu um erro desconhecido."
              toast.error("Falha ao alocar turma", { description: errorMsg })
              setErrorSlot({
                day: slotInfo.day,
                startTime: slotInfo.startTime,
                endTime: slotInfo.endTime,
              })
              setTimeout(() => setErrorSlot(null), 3000)
            },
          },
        )
      } catch (error) {
        console.error("Erro na validação ou criação da alocação:", error)
        const errorMsg =
          error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
        toast.error("Falha ao alocar turma", { description: errorMsg })
        setErrorSlot({
          day: slotInfo.day,
          startTime: slotInfo.startTime,
          endTime: slotInfo.endTime,
        })
        setTimeout(() => setErrorSlot(null), 3000)
      }
    },
    [
      turmaSelecionada,
      configuracaoHorario,
      validateAlocacaoMutation,
      createAlocacaoMutation,
      queryClient,
    ],
  )

  const handleAlocacaoCardClick = useCallback(
    (alocacao: AlocacaoHorarioResponseDto) => {
      setSelectedAlocacaoOnGrid(alocacao)
      setSelectedSlot(null)
      toast.info(
        `Alocação selecionada: ${alocacao.turma.codigoDaTurma} - ${alocacao.turma.disciplinaOfertada.disciplina.nome}`,
      )
    },
    [],
  )

  const handleRefresh = useCallback(() => {
    refetchTurmas()
  }, [refetchTurmas])

  const handleSave = useCallback(() => {
    // TODO: Implementar salvamento
    console.log("Salvar propostas")
  }, [])

  const handleAttemptRemoveAlocacao = () => {
    if (!selectedAlocacaoOnGrid) {
      toast.info("Nenhuma alocação selecionada para remover.")
      return
    }
    setIsConfirmDeleteOpen(true)
  }

  const executeRemoveAlocacao = async () => {
    if (!selectedAlocacaoOnGrid) return

    try {
      await deleteAlocacaoMutation.mutateAsync(
        { id: selectedAlocacaoOnGrid.id },
        {
          onSuccess: () => {
            toast.success("Alocação removida com sucesso!")
            setSelectedAlocacaoOnGrid(null)
            queryClient.invalidateQueries({
              queryKey: ["alocacoesHorariosControllerFindMany"],
            })
          },
          onError: (error) => {
            console.error("Erro ao remover alocação:", error)
            const errorMsg =
              error instanceof Error ? error.message : "Erro desconhecido"
            toast.error(`Falha ao remover alocação: ${errorMsg}`)
          },
        },
      )
    } catch (error) {
      console.error("Erro ao remover alocação:", error)
      const errorMsg =
        error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Falha ao remover alocação: ${errorMsg}`)
    }
    setIsConfirmDeleteOpen(false)
  }

  // Função para formatar o nome do período letivo
  const formatPeriodoNome = (periodo: any) => {
    return `${periodo.ano}.${periodo.semestre}`
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <PropostasHorarioHeader
        onRefresh={handleRefresh}
        onSave={handleSave}
      />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Configure os filtros para visualizar as turmas e horários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período Letivo</label>
              <Select
                value={periodoLetivoSelecionado}
                onValueChange={setPeriodoLetivoSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período letivo" />
                </SelectTrigger>
                <SelectContent>
                  {periodosLetivos?.map((periodo) => (
                    <SelectItem
                      key={periodo.id}
                      value={periodo.id}
                    >
                      {formatPeriodoNome(periodo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {periodoLetivoSelecionado && (
        <TurmasStatistics
          total={estatisticas.total}
          totalNaoAlocadas={estatisticas.totalNaoAlocadas}
          totalParcialmenteAlocadas={estatisticas.totalParcialmenteAlocadas}
          totalTotalmenteAlocadas={estatisticas.totalTotalmenteAlocadas}
          isLoading={isLoadingTurmas}
        />
      )}

      {/* Turma Selecionada e Ações de Alocação (Exemplo de local para botões) */}
      <Card>
        <CardHeader>
          <CardTitle>Ações da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Turma Selecionada para Alocar */}
          {turmaSelecionada && (
            <div className="bg-muted rounded-md border p-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">
                    Turma Selecionada para Alocar:{" "}
                    {turmaSelecionada.turma.codigoDaTurma}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {turmaSelecionada.turma.disciplinaOfertada?.disciplina?.nome}{" "}
                    - Prof:{" "}
                    {turmaSelecionada.turma.professorAlocado?.nome ||
                      "Não atribuído"}
                  </p>
                </div>
              </div>
              {selectedSlot && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Slot para nova alocação: {selectedSlot.day}{" "}
                  {selectedSlot.startTime}-{selectedSlot.endTime}
                </p>
              )}
            </div>
          )}

          {/* Mensagem para selecionar turma se slot estiver selecionado mas turma não */}
          {selectedSlot && !turmaSelecionada && (
            <div className="flex items-start gap-3 rounded-md border border-amber-500 bg-amber-50 p-3 text-amber-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Atenção</p>
                <p className="text-sm">
                  Selecione uma turma da lista à esquerda para alocar no slot
                  escolhido ({selectedSlot.day} {selectedSlot.startTime}-
                  {selectedSlot.endTime}).
                </p>
              </div>
            </div>
          )}

          {/* Alocação Selecionada para Remover */}
          {selectedAlocacaoOnGrid && (
            <div className="border-destructive bg-destructive/10 rounded-md border p-3">
              <p className="text-destructive font-medium">
                Alocação Selecionada para Remover:{" "}
                {selectedAlocacaoOnGrid.turma.codigoDaTurma}
              </p>
              <p className="text-destructive/80 text-sm">
                {selectedAlocacaoOnGrid.turma.disciplinaOfertada.disciplina.nome}{" "}
                ({selectedAlocacaoOnGrid.diaDaSemana}{" "}
                {selectedAlocacaoOnGrid.horaInicio}-
                {selectedAlocacaoOnGrid.horaFim})
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => selectedSlot && handleSlotClick(selectedSlot)}
              disabled={
                !turmaSelecionada ||
                !selectedSlot ||
                isValidatingAlocacao ||
                isCreatingAlocacao
              }
            >
              {(isValidatingAlocacao || isCreatingAlocacao) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Alocar Turma no Slot
            </Button>
            <Button
              onClick={handleAttemptRemoveAlocacao}
              disabled={!selectedAlocacaoOnGrid || isDeletingAlocacao}
              variant="destructive"
            >
              {isDeletingAlocacao && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remover Alocação Selecionada
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layout Principal */}
      {periodoLetivoSelecionado && configuracaoHorario && (
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* Lista de Turmas */}
          <TurmasListComponent
            turmas={turmasParaAlocacao}
            isLoading={isLoadingTurmas}
            turmaSelecionada={turmaSelecionada?.turma}
            onTurmaSelect={selecionarTurma}
            onSearchChange={setSearchTerm}
            filtrosAtivos={{ searchTerm }}
          />

          {/* Grid de Horários */}
          <Card>
            <CardHeader>
              <CardTitle>Grade de Horários</CardTitle>
              <CardDescription>
                Selecione uma turma para começar a alocação
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingAlocacoes ?
                <p>Carregando alocações...</p>
              : <ScheduleGrid
                  configuracaoHorario={configuracaoHorario}
                  alocacoes={alocacoesVisiveis}
                  onSlotClick={handleSlotClick}
                  onAlocacaoClick={handleAlocacaoCardClick}
                  errorSlot={errorSlot}
                />
              }
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mensagem quando nenhum período está selecionado */}
      {!periodoLetivoSelecionado && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground text-center">
              <p>Selecione um período letivo para começar</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AlertDialog para confirmação de deleção */}
      <AlertDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a alocação para "
              {selectedAlocacaoOnGrid?.turma.disciplinaOfertada.disciplina.nome}{" "}
              (Turma: {selectedAlocacaoOnGrid?.turma.codigoDaTurma})"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAlocacao}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeRemoveAlocacao}
              disabled={isDeletingAlocacao}
            >
              {isDeletingAlocacao && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * Página principal de propostas de horário
 */
export function PropostasHorarioPage() {
  return (
    <TurmaSelectionProvider>
      <PropostasHorarioContent />
    </TurmaSelectionProvider>
  )
}
