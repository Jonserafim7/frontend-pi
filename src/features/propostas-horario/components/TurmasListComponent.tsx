import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle, Search, Filter, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TurmaParaAlocacao, TurmaAllocationStatus } from "../types"

interface TurmasListComponentProps {
  /** Lista de turmas para exibir */
  turmas: TurmaParaAlocacao[]
  /** Estado de carregamento */
  isLoading?: boolean
  /** Turma atualmente selecionada */
  turmaSelecionada?: TurmaParaAlocacao | null
  /** Callback quando uma turma é selecionada */
  onTurmaSelect?: (turma: TurmaParaAlocacao) => void
  /** Callback para atualizar filtros de busca */
  onSearchChange?: (searchTerm: string) => void
  /** Callback para filtrar por status */
  onStatusFilter?: (status: TurmaAllocationStatus[]) => void
  /** Filtros ativos */
  filtrosAtivos?: {
    searchTerm?: string
    statusSelecionados?: TurmaAllocationStatus[]
  }
}

/**
 * Componente para exibir lista de turmas disponíveis para alocação
 */
export function TurmasListComponent({
  turmas,
  isLoading = false,
  turmaSelecionada,
  onTurmaSelect,
  onSearchChange,
  onStatusFilter,
  filtrosAtivos = {},
}: TurmasListComponentProps) {
  const [filtroStatus, setFiltroStatus] = useState<
    TurmaAllocationStatus | "todos"
  >("todos")

  // Aplicar filtros locais se não houver callback para servidor
  const turmasFiltradas = useMemo(() => {
    if (onSearchChange) {
      // Se há callback, os filtros são aplicados no servidor
      return turmas
    }

    // Aplicar filtros locais apenas se não há callback
    let resultado = turmas

    if (filtroStatus !== "todos") {
      resultado = resultado.filter(
        (turma) => turma.statusAlocacao === filtroStatus,
      )
    }

    return resultado
  }, [turmas, filtroStatus, onSearchChange])

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  const handleStatusFilter = (status: TurmaAllocationStatus | "todos") => {
    setFiltroStatus(status)
    if (onStatusFilter) {
      const statusArray = status === "todos" ? [] : [status]
      onStatusFilter(statusArray)
    }
  }

  const getStatusBadgeVariant = (status: TurmaAllocationStatus) => {
    switch (status) {
      case "totalmente-alocada":
        return "default" // Verde
      case "parcialmente-alocada":
        return "secondary" // Amarelo
      case "nao-alocada":
        return "outline" // Cinza
      case "conflito":
        return "destructive" // Vermelho
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: TurmaAllocationStatus) => {
    switch (status) {
      case "totalmente-alocada":
        return "Completa"
      case "parcialmente-alocada":
        return "Parcial"
      case "nao-alocada":
        return "Pendente"
      case "conflito":
        return "Conflito"
      default:
        return "Desconhecido"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Turmas Disponíveis</CardTitle>
          <CardDescription>Carregando turmas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
              >
                <div className="bg-muted h-16 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Turmas Disponíveis</CardTitle>
        <CardDescription>
          Clique em uma turma para selecioná-la para alocação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por código, disciplina ou professor..."
            className="pl-10"
            defaultValue={filtrosAtivos.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Filtros por Status */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filtroStatus === "todos" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter("todos")}
          >
            Todas
          </Button>
          <Button
            variant={filtroStatus === "nao-alocada" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter("nao-alocada")}
            className="gap-1"
          >
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            Pendentes
          </Button>
          <Button
            variant={
              filtroStatus === "parcialmente-alocada" ? "default" : "outline"
            }
            size="sm"
            onClick={() => handleStatusFilter("parcialmente-alocada")}
            className="gap-1"
          >
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            Parciais
          </Button>
          <Button
            variant={
              filtroStatus === "totalmente-alocada" ? "default" : "outline"
            }
            size="sm"
            onClick={() => handleStatusFilter("totalmente-alocada")}
            className="gap-1"
          >
            <div className="h-2 w-2 rounded-full bg-green-400" />
            Completas
          </Button>
        </div>

        {/* Lista de Turmas */}
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {turmasFiltradas.length === 0 ?
            <div className="text-muted-foreground py-8 text-center">
              <Filter className="mx-auto mb-2 h-8 w-8" />
              <p>Nenhuma turma encontrada</p>
            </div>
          : turmasFiltradas.map((turma) => (
              <TooltipProvider key={turma.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "cursor-pointer rounded-lg border p-3 transition-all",
                        "hover:bg-muted/50 hover:border-primary/50",
                        turmaSelecionada?.id === turma.id &&
                          "border-primary bg-primary/5 ring-primary/20 ring-1",
                      )}
                      onClick={() => onTurmaSelect?.(turma)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {turma.codigoDaTurma}
                            </span>
                            <Badge
                              variant={getStatusBadgeVariant(
                                turma.statusAlocacao,
                              )}
                            >
                              {getStatusLabel(turma.statusAlocacao)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground truncate text-sm">
                            {turma.disciplinaOfertada?.disciplina?.nome ||
                              "Disciplina não informada"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Prof:{" "}
                            {turma.professorAlocado?.nome || "Não atribuído"}
                          </p>
                        </div>
                        {turmaSelecionada?.id === turma.id && (
                          <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="max-w-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{turma.codigoDaTurma}</p>
                      <p className="text-sm">
                        {turma.disciplinaOfertada?.disciplina?.nome}
                      </p>
                      <p className="text-sm">
                        Carga Horária:{" "}
                        {turma.disciplinaOfertada?.disciplina?.cargaHoraria}h
                      </p>
                      <p className="text-sm">
                        Professor:{" "}
                        {turma.professorAlocado?.nome || "Não atribuído"}
                      </p>
                      <p className="text-sm">
                        Alocação: {turma.aulasAlocadas}/{turma.totalAulas} aulas
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}
