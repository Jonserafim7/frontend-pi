// Export all types from sub-modules
export * from "./alocacao.types"
export * from "./grid.types"
export * from "./dnd.types"

// Re-export commonly used types with aliases for convenience
export type {
  AlocacaoHorarioResponseDto as Alocacao,
  CreateAlocacaoHorarioDto as CreateAlocacao,
  TurmaBasicaDto as Turma,
  ProfessorBasicoDto as Professor,
  DiaSemana,
} from "./alocacao.types"

export type {
  GridCell as Cell,
  GridRow as Row,
  GridData as Grid,
  TimeSlot as Slot,
  GridConfiguration as Config,
} from "./grid.types"

export type {
  DragItem as Draggable,
  DropZone as Droppable,
  DragState as DragStatus,
  DragConflict as Conflict,
} from "./dnd.types"
