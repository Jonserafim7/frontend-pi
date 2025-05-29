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
  /** Erro ao carregar turmas */
  error?: Error | null
  /** Turma atualmente selecionada */
  turmaSelecionada?: string | null
  /** Callback quando uma turma é selecionada */
  onTurmaSelect?: (turma: TurmaParaAlocacao) => void
  /** Callback quando uma turma é desselecionada */
  onTurmaDeselect?: (turmaId: string) => void
  /** Verificar se uma turma está selecionada */
  isSelecionada?: (turmaId: string) => boolean
  /** Título do componente */
  title?: string
  /** Descrição do componente */
  description?: string
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente reutilizável para exibir lista de turmas com funcionalidades de busca e seleção
 */
export function TurmasListComponent({
  turmas,
  isLoading = false,
  error = null,
  turmaSelecionada,
  onTurmaSelect,
  onTurmaDeselect,
  isSelecionada,
  title = "Turmas Disponíveis",
  description = "Clique em uma turma para selecioná-la para alocação",
  className,
}: TurmasListComponentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TurmaAllocationStatus | "all">(
    "all",
  )

  // Filtrar turmas baseado na busca e filtros
  const turmasFiltradas = useMemo(() => {
    let resultado = turmas

    // Filtro por texto de busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase()
      resultado = resultado.filter(
        (turma) =>
          turma.codigoDaTurma?.toLowerCase().includes(termo) ||
          turma.disciplinaOfertada?.disciplina?.nome
            ?.toLowerCase()
            .includes(termo) ||
          turma.professorAlocado?.nome?.toLowerCase().includes(termo),
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      resultado = resultado.filter(
        (turma) => turma.statusAlocacao === statusFilter,
      )
    }

    return resultado
  }, [turmas, searchTerm, statusFilter])

  const handleTurmaClick = (turma: TurmaParaAlocacao) => {
    const isSelected = isSelecionada?.(turma.id) || turmaSelecionada === turma.id

    if (isSelected) {
      onTurmaDeselect?.(turma.id)
    } else {
      onTurmaSelect?.(turma)
    }
  }

  const getStatusBadgeColor = (status: TurmaAllocationStatus) => {
    switch (status) {
      case "totalmente-alocada":
        return "bg-green-100 text-green-800"
      case "parcialmente-alocada":
        return "bg-yellow-100 text-yellow-800"
      case "nao-alocada":
        return "bg-gray-100 text-gray-800"
      case "conflito":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <TooltipProvider>
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>

          {/* Controles de busca e filtro */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por código, disciplina ou professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "nao-alocada" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("nao-alocada")}
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-gray-400" />
                Pendentes
              </Button>
              <Button
                variant={
                  statusFilter === "parcialmente-alocada" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setStatusFilter("parcialmente-alocada")}
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-yellow-400" />
                Parciais
              </Button>
              <Button
                variant={
                  statusFilter === "totalmente-alocada" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setStatusFilter("totalmente-alocada")}
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-green-400" />
                Completas
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="max-h-96 space-y-2 overflow-y-auto">
          {isLoading && (
            <div className="py-8 text-center">
              <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <span className="text-muted-foreground text-sm">
                Carregando turmas...
              </span>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <span className="text-sm text-red-500">
                Erro ao carregar turmas
              </span>
            </div>
          )}

          {!isLoading && !error && turmasFiltradas.length === 0 && (
            <div className="py-8 text-center">
              <span className="text-muted-foreground text-sm">
                {searchTerm || statusFilter !== "all" ?
                  "Nenhuma turma encontrada com os filtros aplicados"
                : "Nenhuma turma disponível"}
              </span>
            </div>
          )}

          {turmasFiltradas.map((turma) => {
            const isSelected =
              isSelecionada?.(turma.id) || turmaSelecionada === turma.id

            return (
              <div
                key={turma.id}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-sm",
                  isSelected ?
                    "border-primary bg-primary/10 hover:bg-primary/15 shadow-sm"
                  : "hover:bg-muted/50 hover:border-muted-foreground/20",
                )}
                onClick={() => handleTurmaClick(turma)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {turma.codigoDaTurma}
                      </div>
                      {isSelected && (
                        <CheckCircle className="text-primary h-4 w-4 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {turma.disciplinaOfertada?.disciplina?.nome ||
                        "Disciplina não informada"}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {turma.professorAlocado?.nome || "Sem professor atribuído"}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        className="max-w-xs"
                      >
                        <div className="space-y-1 text-xs">
                          <div>
                            <strong>Código:</strong> {turma.codigoDaTurma}
                          </div>
                          <div>
                            <strong>Disciplina:</strong>{" "}
                            {turma.disciplinaOfertada?.disciplina?.nome || "N/A"}
                          </div>
                          <div>
                            <strong>Professor:</strong>{" "}
                            {turma.professorAlocado?.nome || "Não atribuído"}
                          </div>
                          <div>
                            <strong>Status:</strong>{" "}
                            {getStatusLabel(turma.statusAlocacao)}
                          </div>
                          <div>
                            <strong>Aulas:</strong> {turma.aulasAlocadas}/
                            {turma.totalAulas}
                          </div>
                          {turma.conflitos && turma.conflitos.length > 0 && (
                            <div>
                              <strong>Conflitos:</strong>{" "}
                              {turma.conflitos.join(", ")}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        getStatusBadgeColor(turma.statusAlocacao),
                      )}
                    >
                      {turma.aulasAlocadas}/{turma.totalAulas}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
