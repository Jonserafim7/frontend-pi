// Export main page component
export { AlocacaoHorariosPage } from "./pages"

// Export grid components
export {
  HorarioGrid,
  GridHeader,
  HorarioSlot,
  AlocacaoBlock,
} from "./components/grid"

// Export types for external use
export type {
  AlocacaoHorarioResponseDto,
  CreateAlocacaoHorarioDto,
  GridData,
  GridCell,
  GridViewOptions,
  AlocacaoFilters,
  ConflictInfo,
} from "./types"

// Default export for main page
export { default } from "./pages"
