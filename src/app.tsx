import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"

import { AppRoutes } from "./routes"
import { AuthProvider } from "./features/auth/contexts/auth-context"
import { queryClient } from "./lib/react-query"
import { DndProvider } from "./providers/DndProvider"

// Import types for the onAlocacaoDrop mock function
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"
import type { GridCell } from "@/features/alocacoes-horarios/types"

/**
 * Main application component
 * Wraps the app with required providers
 */
function App(): React.ReactElement {
  // Mock function for onAlocacaoDrop
  const handleAlocacaoDrop = (turma: TurmaResponseDto, targetCell: GridCell) => {
    console.log("[App.tsx] Turma dropped:", turma, "on cell:", targetCell)
    // Corrected alert to use an existing property from TurmaResponseDto
    alert(
      `Turma ID ${turma.id} (Ofertada ID: ${turma.idDisciplinaOfertada}) dropped on ${targetCell.dia} at ${targetCell.timeSlot.inicio}`,
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider onAlocacaoDrop={handleAlocacaoDrop}>
        <AuthProvider>
          <div className="app-container min-h-screen">
            <AppRoutes />
          </div>
        </AuthProvider>
      </DndProvider>
    </QueryClientProvider>
  )
}

export default App
