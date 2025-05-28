import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Calendar, Filter, Download, RefreshCw } from "lucide-react"

import { HorarioGrid } from "../components/grid"
import type { AlocacaoHorarioResponseDto } from "../types"

/**
 * Main page for schedule allocation management
 * Provides interface for coordinators to manage class schedules
 */
export const AlocacaoHorariosPage: React.FC = () => {
  // TODO: Replace with actual state management
  const [selectedPeriodoLetivo, setSelectedPeriodoLetivo] = useState<string>("")
  const [selectedCurso, setSelectedCurso] = useState<string>("")

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

      {/* Filters and Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Period and Course selectors */}
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Período:</span>
              {/* TODO: Replace with actual period selector */}
              <Badge variant="outline">2024.1</Badge>
            </div>

            <Separator
              orientation="vertical"
              className="h-6"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Curso:</span>
              {/* TODO: Replace with actual course selector */}
              <Badge variant="outline">
                Análise e Desenvolvimento de Sistemas
              </Badge>
            </div>
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Turmas Disponíveis</h3>
                <Badge variant="secondary">5</Badge>
              </div>

              <div className="space-y-2">
                {/* TODO: Replace with actual turmas list */}
                {[
                  { id: "1", codigo: "ADS101", disciplina: "Programação I" },
                  { id: "2", codigo: "ADS102", disciplina: "Matemática" },
                  { id: "3", codigo: "ADS103", disciplina: "Algoritmos" },
                  { id: "4", codigo: "ADS104", disciplina: "BD I" },
                  { id: "5", codigo: "ADS105", disciplina: "Redes" },
                ].map((turma) => (
                  <Card
                    key={turma.id}
                    className="cursor-grab p-3 transition-shadow hover:shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {turma.codigo}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{turma.disciplina}</p>
                      <p className="text-muted-foreground text-xs">
                        Arraste para alocar
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Filtros</h4>
                {/* TODO: Add filter components */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar por professor
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar por disciplina
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="lg:col-span-3">
          <HorarioGrid
            periodoLetivoId={selectedPeriodoLetivo || "default"}
            cursoId={selectedCurso}
            onAlocacaoCreate={handleAlocacaoCreate}
            onAlocacaoUpdate={handleAlocacaoUpdate}
            onAlocacaoDelete={handleAlocacaoDelete}
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
              Arraste turmas da sidebar para os slots de horário desejados. Clique
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
