import type {
  AlocacaoHorarioResponseDtoDiaDaSemana,
  AlocacaoHorarioResponseDto,
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoResponseDto,
  TurmaBasicaDto,
  ProfessorBasicoDto,
  DisciplinaBasicaDto,
} from "../../../api-generated/model"

// Re-export the main types from Orval for easier imports
export type {
  AlocacaoHorarioResponseDto,
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoResponseDto,
  TurmaBasicaDto,
  ProfessorBasicoDto,
  DisciplinaBasicaDto,
}

// Create a more friendly alias for DiaSemana
export type DiaSemana = AlocacaoHorarioResponseDtoDiaDaSemana

// Re-export with friendly name
export { AlocacaoHorarioResponseDtoDiaDaSemana as DiaSemanaEnum } from "../../../api-generated/model"

// Extended types for the frontend feature
export interface AlocacaoExtended extends AlocacaoHorarioResponseDto {
  // Add any frontend-specific extensions here
  isConflicted?: boolean
  isDragPreview?: boolean
  isHighlighted?: boolean
}

// Filter and search types
export interface AlocacaoFilters {
  periodoLetivoId?: string
  cursoId?: string
  professorId?: string
  turmaId?: string
  diaDaSemana?: DiaSemana
  turno?: "MATUTINO" | "VESPERTINO" | "NOTURNO"
  status?: "ATIVA" | "INATIVA" | "CONFLITO"
}

// Grid and visualization types
export interface HorarioSlotInfo {
  dia: DiaSemana
  horaInicio: string
  horaFim: string
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO"
  slotIndex: number
}

export interface GridPosition {
  dia: DiaSemana
  slotIndex: number
  rowSpan?: number // For multi-period classes
}

// Conflict detection types
export interface ConflictInfo {
  type: "PROFESSOR_CONFLICT" | "TURMA_CONFLICT" | "HORARIO_INVALID"
  message: string
  details?: {
    conflictingAlocacao?: AlocacaoHorarioResponseDto
    professor?: ProfessorBasicoDto
    horario?: string
  }
}

// UI State types
export interface AlocacaoUIState {
  selectedAlocacao?: AlocacaoHorarioResponseDto | null
  draggedTurma?: TurmaBasicaDto | null
  highlightedSlot?: HorarioSlotInfo | null
  isValidating: boolean
  validationResult?: ValidateAlocacaoResponseDto | null
  conflicts: ConflictInfo[]
}

// Form types
export interface CreateAlocacaoFormData {
  turmaId: string
  diaDaSemana: DiaSemana
  horaInicio: string
  horaFim: string
}

export interface EditAlocacaoFormData extends CreateAlocacaoFormData {
  id: string
}

// API response helpers
export interface AlocacaoOperationResult {
  success: boolean
  data?: AlocacaoHorarioResponseDto
  error?: string
  conflicts?: ConflictInfo[]
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Export utility type for component props
export type ComponentWithBaseProps<T = {}> = T & BaseComponentProps
