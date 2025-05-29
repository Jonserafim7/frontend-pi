import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, User, Clock, GripVertical, Info, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// Import types
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"
import type { ComponentWithBaseProps } from "../../types"

interface TurmaCardProps extends ComponentWithBaseProps {
  /** Dados da turma */
  turma: TurmaResponseDto
  /** Se o card está sendo arrastado */
  isDragging?: boolean
  /** Se o card está selecionado */
  isSelected?: boolean
  /** Callback quando o card é clicado */
  onClick?: (turma: TurmaResponseDto) => void
  /** Callback para exibir mais informações */
  onShowDetails?: (turma: TurmaResponseDto) => void
  /** Se está no modo compacto */
  compact?: boolean
}

/**
 * Component for displaying individual turma information in a card format
 */
export const TurmaCard: React.FC<TurmaCardProps> = ({
  turma,
  isDragging = false,
  isSelected = false,
  onClick,
  onShowDetails,
  compact = false,
  className = "",
}) => {
  // Extract data from turma object
  const disciplinaNome = turma.disciplinaOfertada?.disciplina?.nome || "N/D"
  const disciplinaCodigo = turma.disciplinaOfertada?.disciplina?.codigo || ""
  const professorNome = turma.professorAlocado?.nome || "Sem professor"
  const professorPrimeiroNome = professorNome.split(" ")[0]
  const cargaHoraria = turma.disciplinaOfertada?.disciplina?.cargaHoraria || 0
  const semestre = turma.disciplinaOfertada?.periodoLetivo?.semestre
  const ano = turma.disciplinaOfertada?.periodoLetivo?.ano

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.(turma)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.(turma)
    }
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShowDetails?.(turma)
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isDragging && "rotate-2 opacity-60 shadow-lg",
        isSelected && "ring-primary ring-2 ring-offset-1",
        compact ? "p-2" : "p-3",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Turma ${turma.codigoDaTurma} - ${disciplinaNome}`}
    >
      <CardContent className={cn("space-y-2", compact ? "p-2" : "p-3")}>
        {/* Header: Drag handle and discipline info */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <GripVertical
                className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h4
                  className={cn(
                    "truncate leading-tight font-semibold",
                    compact ? "text-xs" : "text-sm",
                  )}
                  title={disciplinaNome}
                >
                  {disciplinaNome}
                </h4>
                {disciplinaCodigo && (
                  <p
                    className={cn(
                      "text-muted-foreground mt-0.5",
                      compact ? "text-xs" : "text-sm",
                    )}
                  >
                    {disciplinaCodigo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-2 flex items-center gap-1">
            {onShowDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDetailsClick}
                className={cn(
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  compact ? "h-6 w-6" : "h-7 w-7",
                )}
                aria-label="Ver detalhes da turma"
              >
                <Info className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Turma Code and Period */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              Turma:
            </span>
            <Badge
              variant="outline"
              className={compact ? "px-1 text-xs" : "text-sm"}
            >
              {turma.codigoDaTurma}
            </Badge>
          </div>

          {semestre && ano && (
            <div className="flex items-center gap-1">
              <Calendar className="text-muted-foreground h-3 w-3" />
              <span
                className={cn(
                  "text-muted-foreground",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {ano}.{semestre}
              </span>
            </div>
          )}
        </div>

        {/* Professor */}
        {!compact && (
          <div className="flex items-center gap-1">
            <User className="text-muted-foreground h-3 w-3 flex-shrink-0" />
            <span className="text-muted-foreground text-sm">Professor:</span>
            <span
              className="truncate text-sm"
              title={professorNome}
            >
              {professorPrimeiroNome}
            </span>
          </div>
        )}

        {/* Footer: Carga Horária and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="text-muted-foreground h-3 w-3" />
            <span
              className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              CH:
            </span>
            <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
              {cargaHoraria}h
            </span>
          </div>

          <Badge
            variant="secondary"
            className={cn(
              "transition-colors",
              compact ? "px-1 text-xs" : "px-2 text-xs",
            )}
          >
            Disponível
          </Badge>
        </div>

        {/* Professor in compact mode */}
        {compact && professorNome !== "Sem professor" && (
          <div className="flex items-center gap-1 border-t pt-1">
            <User className="text-muted-foreground h-3 w-3" />
            <span
              className="text-muted-foreground truncate text-xs"
              title={professorNome}
            >
              {professorPrimeiroNome}
            </span>
          </div>
        )}

        {/* Drag instruction */}
        <div className="text-center">
          <span
            className={cn(
              "text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
              compact ? "text-xs" : "text-sm",
            )}
          >
            Arraste para alocar
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default TurmaCard
