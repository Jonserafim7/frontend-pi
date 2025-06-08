import type {
  AlocacaoHorarioResponseDto,
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoDto,
  ValidateAlocacaoResponseDto,
  TurmaResponseDto,
  AulaHorarioDto,
} from "@/api-generated/model"

/**
 * Tipos específicos para sistema de alocações em propostas
 * Seguindo o mesmo padrão estabelecido para propostas
 */

/**
 * Enum para dias da semana da grade de horários
 */
export const DIAS_SEMANA = [
  { key: "SEGUNDA", label: "Segunda" },
  { key: "TERCA", label: "Terça" },
  { key: "QUARTA", label: "Quarta" },
  { key: "QUINTA", label: "Quinta" },
  { key: "SEXTA", label: "Sexta" },
  { key: "SABADO", label: "Sábado" },
] as const

/**
 * Tipo utilitário para as chaves dos dias da semana
 */
export type DiaSemanaKey = (typeof DIAS_SEMANA)[number]["key"]

/**
 * Dados para criação de alocação em proposta
 */
export interface CreatePropostaAlocacaoData extends CreateAlocacaoHorarioDto {
  /** ID da proposta associada (obrigatório para alocações de propostas) */
  idPropostaHorario: string
}

/**
 * Interface para turma disponível na proposta
 */
export interface PropostaTurmaDisponivel {
  id: string
  codigo: string
  disciplina: string
  professor?: string
  cargaHoraria?: number
  periodoLetivo: string
  disponivel: boolean
  motivosIndisponibilidade?: string[]
}

/**
 * Props para componentes da grade de propostas
 */
export interface PropostaScheduleGridProps {
  propostaId: string
  className?: string
  readonly?: boolean
}

/**
 * Props para seção de turno de propostas
 */
export interface PropostaTurnoSectionProps {
  titulo: string
  aulas: AulaHorarioDto[]
  inicio: string
  fim: string
  propostaId: string
  readonly?: boolean
}

/**
 * Props para container de célula de propostas
 * Não precisa de alocacao individual - busca todas as alocações do slot automaticamente
 */
export interface PropostaScheduleCellContainerProps {
  dia: DiaSemanaKey
  horario: AulaHorarioDto
  propostaId: string
  readonly?: boolean
}

/**
 * Estado da UI para operações de alocação
 */
export interface PropostaAllocationUIState {
  isLoading: boolean
  isCreating: boolean
  isDeleting: boolean
  isValidating: boolean
  error?: string
  successMessage?: string
}

/**
 * Permissões para alocações baseadas no status da proposta
 */
export interface PropostaAllocationPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canValidate: boolean
}

/**
 * Dados para validação de alocação
 */
export interface PropostaValidateAlocacaoData extends ValidateAlocacaoDto {
  /** Contexto adicional da proposta para validações específicas */
  propostaId?: string
}

/**
 * Resultado estendido de validação de alocação
 */
export interface PropostaValidateAlocacaoResult
  extends ValidateAlocacaoResponseDto {
  /** Detalhes específicos para propostas */
  details?: {
    conflitosNaProposta?: string[]
    turmasDisponiveis?: number
    violacoesRegrasNegocio?: string[]
  }
}

/**
 * Conflito de horário específico da proposta
 */
export interface PropostaConflito {
  tipo: "professor" | "turma" | "sala" | "periodo"
  mensagem: string
  detalhes: {
    entidade1: string
    entidade2: string
    horario: string
    dia: DiaSemanaKey
  }
}

/**
 * Estatísticas de alocação da proposta
 */
export interface PropostaAllocationStats {
  totalSlots: number
  slotsAlocados: number
  slotsDisponiveis: number
  porcentagemPreenchimento: number
  turmasAlocadas: number
  professoresEnvolvidos: number
  conflitosDetectados: number
}

/**
 * Filtros para turmas na proposta
 */
export interface PropostaTurmaFilters {
  disciplinaId?: string
  professorId?: string
  periodo?: number
  disponibilidade?: "todas" | "disponiveis" | "indisponiveis"
  conflitos?: "todos" | "sem_conflitos" | "com_conflitos"
}

/**
 * Contexto de alocação da proposta
 */
export interface PropostaAllocationContext {
  propostaId: string
  cursoId: string
  periodoLetivoId: string
  coordenadorId: string
  status: string
  canEdit: boolean
  alocacoesExistentes: AlocacaoHorarioResponseDto[]
  turmasDisponiveis: TurmaResponseDto[]
  configuracaoHorario: any // TODO: Tipar quando disponível
}

/**
 * Hook options para alocações de propostas
 */
export interface UsePropostaAllocationOptions {
  /** ID da proposta */
  propostaId: string
  /** Configurações de cache */
  cacheTime?: number
  staleTime?: number
  /** Callbacks */
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  /** Controle de execução */
  enabled?: boolean
}

/**
 * Resultado do hook de alocações
 */
export interface PropostaAllocationHookResult {
  // Data
  proposta: any // TODO: Usar tipo específico
  turmasDaProposta: TurmaResponseDto[]
  podeEditarProposta: boolean

  // Loading states
  isLoadingProposta: boolean
  isLoadingTurmas: boolean
  isCreating: boolean
  isDeleting: boolean
  isValidating: boolean

  // Functions
  getTurmasDisponiveis: (
    dia: DiaSemanaKey,
    horaInicio: string,
    horaFim: string,
    alocacoesExistentes?: AlocacaoHorarioResponseDto[],
    alocacoesDaProposta?: AlocacaoHorarioResponseDto[],
  ) => TurmaResponseDto[]

  validateAlocacao: (
    idTurma: string,
    dia: DiaSemanaKey,
    horaInicio: string,
    horaFim: string,
  ) => Promise<ValidateAlocacaoResponseDto>

  criarAlocacao: (
    idTurma: string,
    dia: DiaSemanaKey,
    horaInicio: string,
    horaFim: string,
  ) => Promise<AlocacaoHorarioResponseDto>

  removerAlocacao: (alocacaoId: string) => Promise<boolean>

  // Utility functions
  temSobreposicaoHorario: (
    inicio1: string,
    fim1: string,
    inicio2: string,
    fim2: string,
  ) => boolean

  temConflitoHorario: (
    turma: TurmaResponseDto,
    dia: DiaSemanaKey,
    horaInicio: string,
    horaFim: string,
    alocacoesDaProposta: AlocacaoHorarioResponseDto[],
  ) => { temConflito: boolean; motivo?: string }
}

/**
 * Helper types para componentes específicos
 */
export interface PropostaAllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dia: DiaSemanaKey
  horario: AulaHorarioDto
  alocacoesExistentes?: AlocacaoHorarioResponseDto[]
  turmasDisponiveis?: PropostaTurmaDisponivel[]
  onAlocarTurma?: (turmaId: string) => void
  onRemoverAlocacao?: (alocacaoId: string) => void
  propostaId: string
  readonly?: boolean
}

/**
 * Type guards para alocações
 */
export function isAlocacaoDaProposta(
  alocacao: AlocacaoHorarioResponseDto,
  propostaId: string,
): boolean {
  return (alocacao as any).idPropostaHorario === propostaId
}

/**
 * Helper para verificar se slot está ocupado
 */
export function isSlotOcupado(
  dia: DiaSemanaKey,
  horaInicio: string,
  alocacoes: AlocacaoHorarioResponseDto[],
): boolean {
  return alocacoes.some(
    (alocacao) =>
      alocacao.diaDaSemana === dia && alocacao.horaInicio === horaInicio,
  )
}

/**
 * Helper para obter chave única do slot
 */
export function getSlotKey(dia: DiaSemanaKey, horaInicio: string): string {
  return `${dia}_${horaInicio}`
}

/**
 * Helper para mapear alocações para mapa de busca rápida
 */
export function createAlocacoesMap(
  alocacoes: AlocacaoHorarioResponseDto[],
): Map<string, AlocacaoHorarioResponseDto> {
  const map = new Map<string, AlocacaoHorarioResponseDto>()
  alocacoes.forEach((alocacao) => {
    const key = getSlotKey(
      alocacao.diaDaSemana as DiaSemanaKey,
      alocacao.horaInicio,
    )
    map.set(key, alocacao)
  })
  return map
}

/**
 * Re-exports dos tipos do Orval que funcionam corretamente
 */
export type {
  AlocacaoHorarioResponseDto,
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoDto,
  ValidateAlocacaoResponseDto,
  TurmaResponseDto,
  AulaHorarioDto,
} from "@/api-generated/model"
