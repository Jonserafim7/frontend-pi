import type { TurmaResponseDto } from "@/api-generated/model"

// Tipos específicos para alocação de turmas em propostas de horário
// Reutilizando a feature turmas existente

/**
 * Status de alocação de uma turma no grid de horários
 */
export type TurmaAllocationStatus =
  | "nao-alocada" // Turma ainda não foi alocada em nenhum horário
  | "parcialmente-alocada" // Turma tem algumas aulas alocadas, mas não todas
  | "totalmente-alocada" // Turma tem todas as aulas alocadas
  | "conflito" // Turma tem conflitos de horário

/**
 * Turma estendida com informações específicas de alocação de horários
 */
export interface TurmaParaAlocacao extends TurmaResponseDto {
  /** Status de alocação da turma */
  statusAlocacao: TurmaAllocationStatus
  /** Número de aulas já alocadas */
  aulasAlocadas: number
  /** Número total de aulas que precisam ser alocadas */
  totalAulas: number
  /** Lista de conflitos de horário, se houver */
  conflitos?: string[]
  /** Indica se a turma pode ser alocada (tem professor e está ativa) */
  podeSerAlocada: boolean
  /** Cor para exibição no grid */
  corStatus: "green" | "yellow" | "red" | "gray"
}

/**
 * Filtros específicos para buscar turmas para alocação
 */
export interface FiltrosTurmasAlocacao {
  /** ID do período letivo (obrigatório) */
  periodoLetivoId: string
  /** ID do curso para filtrar turmas específicas */
  cursoId?: string
  /** Filtrar apenas turmas sem alocação de horário */
  somenteNaoAlocadas?: boolean
  /** Filtrar apenas turmas com professor atribuído */
  somenteComProfessor?: boolean
  /** Filtrar por status de alocação */
  statusAlocacao?: TurmaAllocationStatus[]
}

/**
 * Parâmetros para o hook de turmas para alocação
 */
export interface UseTurmasAlocacaoParams {
  /** Filtros para busca */
  filtros: FiltrosTurmasAlocacao
  /** Habilitar busca automática */
  enabled?: boolean
}

/**
 * Resultado processado das turmas para alocação
 */
export interface TurmasAlocacaoResult {
  /** Lista de turmas processadas */
  turmas: TurmaParaAlocacao[]
  /** Total de turmas encontradas */
  total: number
  /** Turmas agrupadas por status */
  porStatus: {
    naoAlocadas: TurmaParaAlocacao[]
    parcialmenteAlocadas: TurmaParaAlocacao[]
    totalmenteAlocadas: TurmaParaAlocacao[]
    comConflitos: TurmaParaAlocacao[]
  }
  /** Estatísticas */
  estatisticas: {
    totalNaoAlocadas: number
    totalParcialmenteAlocadas: number
    totalTotalmenteAlocadas: number
    totalComConflitos: number
    percentualAlocado: number
  }
}

/**
 * Dados para seleção de turma no grid
 */
export interface TurmaSelecionada {
  /** Turma selecionada */
  turma: TurmaParaAlocacao
  /** Timestamp da seleção */
  selecionadaEm: Date
}

/**
 * Contexto de seleção de turmas
 */
export interface TurmaSelectionContext {
  /** Turma atualmente selecionada */
  turmaSelecionada: TurmaSelecionada | null
  /** Selecionar uma turma */
  selecionarTurma: (turma: TurmaParaAlocacao) => void
  /** Limpar seleção */
  limparSelecao: () => void
  /** Verificar se uma turma está selecionada */
  isSelecionada: (turmaId: string) => boolean
}
