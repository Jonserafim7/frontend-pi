import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Calendar, Download, RefreshCw } from "lucide-react"

// Import components from index
import {
  HorarioGrid,
  TurmasSidebar,
  FiltrosSidebar,
  type FiltrosState,
} from "../components"

// Import types
import type { AlocacaoHorarioResponseDto } from "../types"
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"

/**
 * Main page for schedule allocation management
 * Provides interface for coordinators to manage class schedules
 */
export const AlocacaoHorariosPage: React.FC = () => {
  // Filter state management
  const [filtros, setFiltros] = useState<FiltrosState>({})

  // Selected turma for drag and drop
  const [selectedTurma, setSelectedTurma] = useState<TurmaResponseDto | null>(
    null,
  )
  const [draggingTurma, setDraggingTurma] = useState<TurmaResponseDto | null>(
    null,
  )

  // Event handlers for grid operations
  const handleAlocacaoCreate = (alocacao: AlocacaoHorarioResponseDto) => {
    console.log("Alocação criada:", alocacao)
    // TODO: Implement create handler
  }

  const handleAlocacaoUpdate = (alocacao: AlocacaoHorarioResponseDto) => {
    console.log("Alocação atualizada:", alocacao)
    // TODO: Implement update handler
  }

  const handleAlocacaoDelete = (alocacaoId: string) => {
    console.log("Alocação removida:", alocacaoId)
    // TODO: Implement delete handler
  }

  const handleNewAllocation = () => {
    console.log("Nova alocação manual")
    // TODO: Open create allocation modal
  }

  const handleExport = () => {
    console.log("Exportar horários")
    // TODO: Implement export functionality
  }

  const handleRefresh = () => {
    console.log("Atualizar dados")
    // TODO: Implement refresh functionality
  }

  // Sidebar event handlers
  const handleTurmaSelect = (turma: TurmaResponseDto) => {
    setSelectedTurma(turma)
    setDraggingTurma(turma)
  }

  const handleTurmaClick = (turma: TurmaResponseDto) => {
    console.log("Turma clicada:", turma)
    // TODO: Show turma details or perform action
  }

  const handleTurmaDetails = (turma: TurmaResponseDto) => {
    console.log("Ver detalhes da turma:", turma)
    // TODO: Open turma details modal
  }

  const handleFiltrosChange = (novosFiltros: FiltrosState) => {
    setFiltros(novosFiltros)
  }

  // Get display values for header
  const getCurrentPeriodo = () => {
    if (filtros.periodoLetivoId) {
      // TODO: Get actual período from API
      return "2024.1"
    }
    return "Todos os períodos"
  }

  const getCurrentCurso = () => {
    if (filtros.cursoId) {
      // TODO: Get actual curso from API
      return "ADS"
    }
    return "Todos os cursos"
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Alocação de Horários</h1>
          <p className="text-muted-foreground">
            Gerencie a alocação de turmas nos horários semanais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={handleNewAllocation}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Alocação
          </Button>
        </div>
      </div>

      {/* Current Filters Display */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Period and Course selectors */}
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Período:</span>
              <Badge variant="outline">{getCurrentPeriodo()}</Badge>
            </div>

            <Separator
              orientation="vertical"
              className="h-6"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Curso:</span>
              <Badge variant="outline">{getCurrentCurso()}</Badge>
            </div>

            {filtros.professorId && (
              <>
                <Separator
                  orientation="vertical"
                  className="h-6"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Professor:</span>
                  <Badge variant="outline">Filtrado</Badge>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicators */}
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground text-sm">12 alocadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground text-sm">2 conflitos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
              <span className="text-muted-foreground text-sm">8 disponíveis</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Layout with Sidebars */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Filters Sidebar */}
        <div className="xl:col-span-2">
          <FiltrosSidebar
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            showResultCount
            resultCount={8} // TODO: Calculate actual count
            compact
          />
        </div>

        {/* Main Grid */}
        <div className="xl:col-span-7">
          <HorarioGrid
            periodoLetivoId={filtros.periodoLetivoId || ""}
            cursoId={filtros.cursoId}
            onAlocacaoCreate={handleAlocacaoCreate}
            onAlocacaoUpdate={handleAlocacaoUpdate}
            onAlocacaoDelete={handleAlocacaoDelete}
          />
        </div>

        {/* Turmas Sidebar */}
        <div className="xl:col-span-3">
          <TurmasSidebar
            periodoLetivoId={filtros.periodoLetivoId}
            cursoId={filtros.cursoId}
            onTurmaSelect={handleTurmaSelect}
            onTurmaClick={handleTurmaClick}
            onTurmaDetails={handleTurmaDetails}
            selectedTurma={selectedTurma}
            draggingTurma={draggingTurma}
          />
        </div>
      </div>

      {/* Help Text */}
      <Card className="bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <Calendar className="text-primary h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Como usar</h4>
            <p className="text-muted-foreground text-sm">
              Use os filtros à esquerda para encontrar turmas específicas. Arraste
              turmas da sidebar direita para os slots de horário desejados. Clique
              duplo em uma alocação para editá-la. O sistema detecta
              automaticamente conflitos de horário.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AlocacaoHorariosPage
