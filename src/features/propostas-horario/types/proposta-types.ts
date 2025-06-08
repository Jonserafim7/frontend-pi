import type {
  PropostaHorarioResponseDto,
  PropostaHorarioResponseDtoStatus,
} from "@/api-generated/model"

/**
 * Status da proposta com informações adicionais para UI
 */
export type PropostaStatus = PropostaHorarioResponseDtoStatus

/**
 * Mapeamento de status para configurações de UI
 */
export const PROPOSTA_STATUS_CONFIG = {
  DRAFT: {
    label: "Rascunho",
    description: "Proposta em elaboração",
    color: "blue",
    variant: "secondary" as const,
    canEdit: true,
    canSubmit: true,
    canReopen: false,
    canApprove: false,
    canReject: false,
  },
  PENDENTE_APROVACAO: {
    label: "Pendente",
    description: "Aguardando aprovação da direção",
    color: "yellow",
    variant: "warning" as const,
    canEdit: false,
    canSubmit: false,
    canReopen: false,
    canApprove: true,
    canReject: true,
  },
  APROVADA: {
    label: "Aprovada",
    description: "Proposta aprovada pela direção",
    color: "green",
    variant: "success" as const,
    canEdit: false,
    canSubmit: false,
    canReopen: false,
    canApprove: false,
    canReject: false,
  },
  REJEITADA: {
    label: "Rejeitada",
    description: "Proposta rejeitada pela direção",
    color: "red",
    variant: "destructive" as const,
    canEdit: false,
    canSubmit: false,
    canReopen: true,
    canApprove: false,
    canReject: false,
  },
} as const

/**
 * Tipo derivado do status config
 */
export type PropostaStatusVariant =
  (typeof PROPOSTA_STATUS_CONFIG)[keyof typeof PROPOSTA_STATUS_CONFIG]["variant"]

/**
 * Types corretos para as propriedades aninhadas da proposta
 * (O Orval gerou incorretamente como { [key: string]: unknown })
 */

export interface PropostaCurso {
  id: string
  nome: string
  codigo: string | null
}

export interface PropostaPeriodoLetivo {
  id: string
  ano: number
  semestre: number
  dataInicio: Date
  dataFim: Date
}

export interface PropostaCoordenador {
  id: string
  nome: string
  email: string
}

/**
 * Type completo da proposta com tipos corretos
 * Substitui o PropostaHorarioResponseDto gerado que tem subtipos incorretos
 */
export interface PropostaHorario {
  id: string
  curso: PropostaCurso
  periodoLetivo: PropostaPeriodoLetivo
  coordenadorQueSubmeteu: PropostaCoordenador
  status: PropostaStatus
  dataSubmissao: Date | null
  dataAprovacaoRejeicao: Date | null
  justificativaRejeicao: string | null
  observacoesCoordenador: string | null
  observacoesDiretor: string | null
  quantidadeAlocacoes: number
  dataCriacao: string // ISO string
  dataAtualizacao: string // ISO string
}

/**
 * Item da lista de propostas com informações essenciais
 */
export interface PropostaListItem {
  id: string
  curso: {
    id: string
    nome: string
    codigo?: string
  }
  periodoLetivo: {
    id: string
    ano: number
    semestre: number
    descricao: string // Computed: "2024/1"
  }
  coordenadorQueSubmeteu: {
    id: string
    nome: string
    email: string
  }
  status: PropostaStatus
  dataSubmissao?: string
  dataAprovacaoRejeicao?: string
  quantidadeAlocacoes: number
  dataCriacao: string
  dataAtualizacao: string
}

/**
 * Detalhes completos da proposta para página de detalhes
 */
export interface PropostaDetails extends PropostaHorarioResponseDto {
  // Computed fields
  statusConfig: (typeof PROPOSTA_STATUS_CONFIG)[PropostaStatus]
  periodoLetivoDescricao: string // "2024/1"
  isEditable: boolean
  canBeSubmitted: boolean
  canBeReopened: boolean
  canBeApproved: boolean
  canBeRejected: boolean
  hasJustificativaRejeicao: boolean
  hasObservacoesCoordenador: boolean
  hasObservacoesDiretor: boolean
}

/**
 * Filtros para a lista de propostas
 */
export interface PropostaFilters {
  status?: PropostaStatus[]
  cursoId?: string
  coordenadorId?: string
  periodoLetivoId?: string
  dataInicio?: string
  dataFim?: string
}

/**
 * Opções de ordenação para a lista
 */
export type PropostaSortField =
  | "dataCriacao"
  | "dataAtualizacao"
  | "dataSubmissao"
  | "dataAprovacaoRejeicao"
  | "curso.nome"
  | "coordenadorQueSubmeteu.nome"
  | "status"

export interface PropostaSortOptions {
  field: PropostaSortField
  direction: "asc" | "desc"
}

/**
 * Dados para criação de nova proposta
 */
export interface CreatePropostaData {
  idCurso: string
  idPeriodoLetivo: string
  observacoesCoordenador?: string
}

/**
 * Dados para submissão de proposta
 */
export interface SubmitPropostaData {
  observacoesCoordenador?: string
}

/**
 * Dados para aprovação de proposta
 */
export interface ApprovePropostaData {
  observacoesDiretor?: string
}

/**
 * Dados para rejeição de proposta
 */
export interface RejectPropostaData {
  justificativaRejeicao: string
  observacoesDiretor?: string
}

/**
 * Permissões do usuário para ações na proposta
 */
export interface PropostaPermissions {
  canView: boolean
  canEdit: boolean
  canCreate: boolean
  canSubmit: boolean
  canReopen: boolean
  canApprove: boolean
  canReject: boolean
  canDelete: boolean
}

/**
 * Estado da UI para operações de propostas
 */
export interface PropostaUIState {
  isLoading: boolean
  isSubmitting: boolean
  isApproving: boolean
  isRejecting: boolean
  isReopening: boolean
  isDeleting: boolean
  error?: string
  successMessage?: string
}

/**
 * Helper types para componentes específicos
 */
export interface PropostaActionMenuProps {
  proposta: PropostaListItem
  permissions: PropostaPermissions
  onView: (id: string) => void
  onEdit?: (id: string) => void
  onSubmit?: (id: string) => void
  onReopen?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * Props para badge de status
 */
export interface PropostaStatusBadgeProps {
  status: PropostaStatus
  size?: "sm" | "md" | "lg"
  showDescription?: boolean
}

/**
 * Helper functions types
 */
export type FormatPeriodoLetivo = (ano: number, semestre: number) => string
export type GetStatusConfig = (
  status: PropostaStatus,
) => (typeof PROPOSTA_STATUS_CONFIG)[PropostaStatus]
export type CanPerformAction = (
  status: PropostaStatus,
  action: keyof (typeof PROPOSTA_STATUS_CONFIG)[PropostaStatus],
) => boolean

/**
 * Type guards para verificação de tipos
 */
export function isPropostaDraft(proposta: PropostaHorario): boolean {
  return proposta.status === "DRAFT"
}

export function isPropostaPendente(proposta: PropostaHorario): boolean {
  return proposta.status === "PENDENTE_APROVACAO"
}

export function isPropostaAprovada(proposta: PropostaHorario): boolean {
  return proposta.status === "APROVADA"
}

export function isPropostaRejeitada(proposta: PropostaHorario): boolean {
  return proposta.status === "REJEITADA"
}

/**
 * Helper para verificar se proposta pode ser editada
 */
export function canEditProposta(proposta: PropostaHorario): boolean {
  return isPropostaDraft(proposta)
}

/**
 * Helper para verificar se proposta pode ser submetida
 */
export function canSubmitProposta(proposta: PropostaHorario): boolean {
  return isPropostaDraft(proposta) && proposta.quantidadeAlocacoes > 0
}

/**
 * Helper para verificar se proposta pode ser reaberta
 */
export function canReopenProposta(proposta: PropostaHorario): boolean {
  return isPropostaRejeitada(proposta)
}

/**
 * Helper para verificar se proposta pode ser aprovada/rejeitada
 */
export function canApproveProposta(proposta: PropostaHorario): boolean {
  return isPropostaPendente(proposta)
}

/**
 * Helper para obter cor do status
 */
export function getStatusColor(status: PropostaStatus): string {
  switch (status) {
    case "DRAFT":
      return "blue"
    case "PENDENTE_APROVACAO":
      return "yellow"
    case "APROVADA":
      return "green"
    case "REJEITADA":
      return "red"
    default:
      return "gray"
  }
}

/**
 * Helper para obter label do status
 */
export function getStatusLabel(status: PropostaStatus): string {
  switch (status) {
    case "DRAFT":
      return "Rascunho"
    case "PENDENTE_APROVACAO":
      return "Pendente"
    case "APROVADA":
      return "Aprovada"
    case "REJEITADA":
      return "Rejeitada"
    default:
      return "Desconhecido"
  }
}

/**
 * Re-exports dos tipos do Orval que funcionam corretamente
 */
export type {
  CreatePropostaHorarioDto,
  UpdatePropostaHorarioDto,
  SubmitPropostaHorarioDto,
  ApprovePropostaDto,
  RejectPropostaDto,
} from "@/api-generated/model"
