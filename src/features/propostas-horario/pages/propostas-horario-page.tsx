import { useState, useCallback } from "react"
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
import { CheckCircle } from "lucide-react"
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
import type {
  ConfiguracaoHorarioDto,
  TurmaResponseDto,
} from "@/api-generated/model"

/**
 * Componente interno que usa o contexto de seleção
 */
function PropostasHorarioContent() {
  const { turmaSelecionada, selecionarTurma } = useTurmaSelection()

  // Estados locais
  const [periodoLetivoSelecionado, setPeriodoLetivoSelecionado] =
    useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

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

  const handleSlotClick = useCallback(
    (slotInfo: {
      day: string
      startTime: string
      endTime: string
      turno: "manha" | "tarde" | "noite"
    }) => {
      console.log("Slot clicado:", slotInfo)
      if (turmaSelecionada) {
        console.log("Turma selecionada:", turmaSelecionada.turma)
        // TODO: Implementar lógica de alocação
      }
    },
    [turmaSelecionada],
  )

  const handleRefresh = useCallback(() => {
    refetchTurmas()
  }, [refetchTurmas])

  const handleSave = useCallback(() => {
    // TODO: Implementar salvamento
    console.log("Salvar propostas")
  }, [])

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

      {/* Turma Selecionada */}
      {turmaSelecionada && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">
                  Turma Selecionada: {turmaSelecionada.turma.codigoDaTurma}
                </p>
                <p className="text-muted-foreground text-sm">
                  {turmaSelecionada.turma.disciplinaOfertada?.disciplina?.nome} -
                  Prof:{" "}
                  {turmaSelecionada.turma.professorAlocado?.nome ||
                    "Não atribuído"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout Principal */}
      {periodoLetivoSelecionado && (
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
            <CardContent>
              {configuracaoHorario ?
                <ScheduleGrid
                  configuracaoHorario={configuracaoHorario}
                  onSlotClick={handleSlotClick}
                />
              : <div className="text-muted-foreground flex h-64 items-center justify-center">
                  <p>Carregando configuração de horário...</p>
                </div>
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
