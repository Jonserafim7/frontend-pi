import type { DiaSemana, AlocacaoHorarioResponseDto } from "./alocacao.types"

// Time slot configuration
export interface TimeSlot {
  inicio: string // "07:30"
  fim: string // "08:20"
  label: string // "1ª Aula"
  slotIndex: number // 0, 1, 2, etc.
}

// Day column configuration
export interface DayColumn {
  dia: DiaSemana
  label: string // "Segunda-feira"
  abbreviation: string // "SEG"
  isWeekend?: boolean
}

// Grid configuration from backend
export interface GridConfiguration {
  duracaoAulaMinutos: number
  numeroAulasPorTurno: number
  slotsAulaManha: TimeSlot[]
  slotsAulaTarde: TimeSlot[]
  slotsAulaNoite: TimeSlot[]
  inicioTurnoManha: string
  inicioTurnoTarde: string
  inicioTurnoNoite: string
  fimTurnoManha: string
  fimTurnoTarde: string
  fimTurnoNoite: string
}

// Grid layout types
export interface GridCell {
  dia: DiaSemana
  timeSlot: TimeSlot
  alocacao?: AlocacaoHorarioResponseDto
  isEmpty: boolean
  isDropZone: boolean
  isHighlighted: boolean
  isConflicted: boolean
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO"
}

export interface GridRow {
  timeSlot: TimeSlot
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO"
  cells: GridCell[]
}

export interface GridData {
  rows: GridRow[]
  columns: DayColumn[]
  alocacoes: AlocacaoHorarioResponseDto[]
  configuration: GridConfiguration
}

// Grid interaction types
export interface GridInteraction {
  type: "CLICK" | "DOUBLE_CLICK" | "DRAG_ENTER" | "DRAG_LEAVE" | "DROP"
  cell: GridCell
  position: { row: number; col: number }
  originalEvent?: React.MouseEvent | React.DragEvent
}

// Grid view options
export interface GridViewOptions {
  showWeekends: boolean
  showEmptySlots: boolean
  highlightConflicts: boolean
  showTurnoSeparators: boolean
  compactView: boolean
  selectedTurno?: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "ALL"
}

// Grid state management
export interface GridState {
  data: GridData
  viewOptions: GridViewOptions
  selectedCell?: GridCell
  dragOverCell?: GridCell
  isLoading: boolean
  error?: string
}

// Grid actions for state management
export type GridAction =
  | { type: "SET_DATA"; payload: GridData }
  | { type: "SET_VIEW_OPTIONS"; payload: Partial<GridViewOptions> }
  | { type: "SELECT_CELL"; payload: GridCell }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_DRAG_OVER"; payload: GridCell }
  | { type: "CLEAR_DRAG_OVER" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "ADD_ALOCACAO"; payload: AlocacaoHorarioResponseDto }
  | { type: "UPDATE_ALOCACAO"; payload: AlocacaoHorarioResponseDto }
  | { type: "REMOVE_ALOCACAO"; payload: string }

// Grid component props
export interface GridHeaderProps {
  columns: DayColumn[]
  viewOptions: GridViewOptions
  onViewOptionsChange: (options: Partial<GridViewOptions>) => void
}

export interface HorarioSlotProps {
  cell: GridCell
  position: { row: number; col: number }
  onInteraction: (interaction: GridInteraction) => void
  isDropTarget: boolean
  isDragOver: boolean
}

export interface AlocacaoBlockProps {
  alocacao: AlocacaoHorarioResponseDto
  cell: GridCell
  isSelected: boolean
  isConflicted: boolean
  onEdit: (alocacao: AlocacaoHorarioResponseDto) => void
  onDelete: (alocacao: AlocacaoHorarioResponseDto) => void
  onMove: (alocacao: AlocacaoHorarioResponseDto, targetCell: GridCell) => void
}

export interface HorarioGridProps {
  periodoLetivoId: string
  cursoId?: string
  filters?: Partial<GridViewOptions>
  onAlocacaoCreate?: (alocacao: AlocacaoHorarioResponseDto) => void
  onAlocacaoUpdate?: (alocacao: AlocacaoHorarioResponseDto) => void
  onAlocacaoDelete?: (alocacaoId: string) => void
}

// Utility types for grid calculations
export interface GridDimensions {
  totalRows: number
  totalColumns: number
  cellWidth: number
  cellHeight: number
  headerHeight: number
  sidebarWidth: number
}

export interface GridCoordinate {
  row: number
  col: number
  x: number
  y: number
}

// Constants
export const DIAS_SEMANA_ORDEM: DiaSemana[] = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
]

export const DIAS_SEMANA_LABELS: Record<DiaSemana, string> = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
}

export const DIAS_SEMANA_ABBREVIATIONS: Record<DiaSemana, string> = {
  SEGUNDA: "SEG",
  TERCA: "TER",
  QUARTA: "QUA",
  QUINTA: "QUI",
  SEXTA: "SEX",
  SABADO: "SAB",
}
