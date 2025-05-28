import type {
  Active,
  Over,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core"
import type { TurmaBasicaDto, AlocacaoHorarioResponseDto } from "./alocacao.types"
import type { GridCell } from "./grid.types"

// Drag item types
export type DragItemType = "TURMA" | "ALOCACAO"

// Droppable zone types
export type DroppableZoneType = "GRID_CELL" | "SIDEBAR" | "TRASH"

// Base drag item interface
export interface BaseDragItem {
  id: string
  type: DragItemType
}

// Specific drag item types
export interface TurmaDragItem extends BaseDragItem {
  type: "TURMA"
  turma: TurmaBasicaDto
  source: "SIDEBAR"
}

export interface AlocacaoDragItem extends BaseDragItem {
  type: "ALOCACAO"
  alocacao: AlocacaoHorarioResponseDto
  source: "GRID"
  originalCell: GridCell
}

// Union type for all drag items
export type DragItem = TurmaDragItem | AlocacaoDragItem

// Drop zone data
export interface DropZoneData {
  id: string
  type: DroppableZoneType
  cell?: GridCell
  accepts: DragItemType[]
  position?: { row: number; col: number }
}

// Grid cell drop zone
export interface GridCellDropZone extends DropZoneData {
  type: "GRID_CELL"
  cell: GridCell
  accepts: ["TURMA", "ALOCACAO"]
  canDrop: boolean
  conflictWarning?: string
}

// Sidebar drop zone (for returning items)
export interface SidebarDropZone extends DropZoneData {
  type: "SIDEBAR"
  accepts: ["ALOCACAO"]
}

// Trash drop zone (for deleting)
export interface TrashDropZone extends DropZoneData {
  type: "TRASH"
  accepts: ["ALOCACAO"]
}

// Drop zone union type
export type DropZone = GridCellDropZone | SidebarDropZone | TrashDropZone

// Drag state management
export interface DragState {
  isDragging: boolean
  draggedItem?: DragItem
  dragOverZone?: DropZone
  validDropZones: DropZone[]
  conflicts: DragConflict[]
  previewPosition?: { x: number; y: number }
}

// Conflict detection during drag
export interface DragConflict {
  type: "PROFESSOR_BUSY" | "SLOT_OCCUPIED" | "INVALID_TIME" | "PERMISSION_DENIED"
  severity: "ERROR" | "WARNING" | "INFO"
  message: string
  details?: {
    conflictingAlocacao?: AlocacaoHorarioResponseDto
    suggestedAlternatives?: GridCell[]
  }
}

// Drag operation result
export interface DragOperationResult {
  success: boolean
  action: "CREATE" | "MOVE" | "DELETE" | "CANCEL"
  data?: {
    alocacao?: AlocacaoHorarioResponseDto
    sourceCell?: GridCell
    targetCell?: GridCell
  }
  conflicts?: DragConflict[]
  error?: string
}

// Event handlers
export interface DragEventHandlers {
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onDragCancel: () => void
}

// Custom drag events
export interface CustomDragEvents {
  onTurmaDragStart: (turma: TurmaBasicaDto) => void
  onAlocacaoDragStart: (
    alocacao: AlocacaoHorarioResponseDto,
    cell: GridCell,
  ) => void
  onValidDrop: (
    dragItem: DragItem,
    dropZone: DropZone,
  ) => Promise<DragOperationResult>
  onInvalidDrop: (
    dragItem: DragItem,
    dropZone: DropZone,
    conflicts: DragConflict[],
  ) => void
  onConflictDetected: (conflicts: DragConflict[]) => void
}

// Drag preview component props
export interface DragOverlayProps {
  draggedItem?: DragItem
  position?: { x: number; y: number }
  conflicts?: DragConflict[]
}

// Draggable component props
export interface DraggableTurmaProps {
  turma: TurmaBasicaDto
  isDisabled?: boolean
  className?: string
  onDragStart?: (turma: TurmaBasicaDto) => void
}

export interface DraggableAlocacaoProps {
  alocacao: AlocacaoHorarioResponseDto
  cell: GridCell
  isDisabled?: boolean
  className?: string
  onDragStart?: (alocacao: AlocacaoHorarioResponseDto, cell: GridCell) => void
}

// Droppable component props
export interface DroppableSlotProps {
  dropZone: DropZone
  isOver?: boolean
  canDrop?: boolean
  children: React.ReactNode
  onDrop?: (dragItem: DragItem) => void
  onConflict?: (conflicts: DragConflict[]) => void
}

// Validation types for drag operations
export interface DragValidation {
  isValid: boolean
  conflicts: DragConflict[]
  canForce?: boolean // Can override conflicts with admin permission
  alternatives?: GridCell[] // Suggested alternative slots
}

// Drag and drop context
export interface DragAndDropContextValue {
  state: DragState
  handlers: DragEventHandlers
  customEvents: CustomDragEvents
  validateDrop: (
    dragItem: DragItem,
    dropZone: DropZone,
  ) => Promise<DragValidation>
  executeOperation: (
    dragItem: DragItem,
    dropZone: DropZone,
  ) => Promise<DragOperationResult>
}

// Drag sensors configuration
export interface DragSensorsConfig {
  mouse: boolean
  touch: boolean
  keyboard: boolean
  pointer: boolean
  activationConstraint?: {
    distance?: number
    delay?: number
    tolerance?: number
  }
}

// Collision detection configuration
export interface CollisionDetectionConfig {
  strategy:
    | "closest-center"
    | "closest-corners"
    | "rect-intersection"
    | "pointer-within-node"
  fallback?: boolean
}

// Animation configuration
export interface DragAnimationConfig {
  duration: number
  easing: string
  layoutMeasuring?: {
    strategy: "always" | "when-necessary"
  }
}

// Complete drag and drop configuration
export interface DragAndDropConfig {
  sensors: DragSensorsConfig
  collision: CollisionDetectionConfig
  animation: DragAnimationConfig
  accessibility: {
    announcements?: boolean
    screenReaderInstructions?: Record<string, string>
  }
}

// Constants for drag and drop
export const DRAG_ITEM_TYPES = {
  TURMA: "TURMA",
  ALOCACAO: "ALOCACAO",
} as const

export const DROP_ZONE_TYPES = {
  GRID_CELL: "GRID_CELL",
  SIDEBAR: "SIDEBAR",
  TRASH: "TRASH",
} as const

export const CONFLICT_TYPES = {
  PROFESSOR_BUSY: "PROFESSOR_BUSY",
  SLOT_OCCUPIED: "SLOT_OCCUPIED",
  INVALID_TIME: "INVALID_TIME",
  PERMISSION_DENIED: "PERMISSION_DENIED",
} as const

export const CONFLICT_SEVERITIES = {
  ERROR: "ERROR",
  WARNING: "WARNING",
  INFO: "INFO",
} as const
