import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Trash2,
  GripVertical,
  BookOpen,
  User as UserIcon,
  Clock,
  AlertTriangle,
  Users as UsersIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import type { GridCell } from "../../types" // Assuming AlocacaoBlockProps will be defined here or this is what it needs

// This prop structure is based on the original intent found in grid.types.ts
// and the previous version of this file.
export interface AlocacaoBlockProps {
  alocacao: AlocacaoHorarioResponseDto
  cell: GridCell // The grid cell this allocation belongs to
  isSelected?: boolean
  isConflicted?: boolean
  isGhost?: boolean // For drag previews
  onEdit?: (alocacao: AlocacaoHorarioResponseDto) => void
  onDelete?: (alocacao: AlocacaoHorarioResponseDto) => void
  // onMove is more related to DND, will be handled in DND task
  // onMove?: (alocacao: AlocacaoHorarioResponseDto, targetCell: GridCell) => void;
  onClick?: (alocacao: AlocacaoHorarioResponseDto, cell: GridCell) => void
  onDoubleClick?: (alocacao: AlocacaoHorarioResponseDto, cell: GridCell) => void
  className?: string
}

// Renamed original component
const AlocacaoBlockComponent: React.FC<AlocacaoBlockProps> = ({
  alocacao,
  cell,
  isSelected,
  isConflicted,
  isGhost,
  onEdit,
  onDelete,
  onClick,
  onDoubleClick,
  className,
}) => {
  const disciplinaNome =
    alocacao.turma?.disciplinaOfertada?.disciplina?.nome || "N/D"
  const disciplinaCodigo =
    alocacao.turma?.disciplinaOfertada?.disciplina?.codigo || ""
  const turmaCodigo = alocacao.turma?.codigoDaTurma || "N/D"
  const professorNome = alocacao.turma?.professorAlocado?.nome || "Não atribuído"
  const professorPrimeiroNome = professorNome.split(" ")[0]

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    onEdit?.(alocacao)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(alocacao)
  }

  const handleCardClick = () => {
    onClick?.(alocacao, cell)
  }

  const handleCardDoubleClick = () => {
    onDoubleClick?.(alocacao, cell)
  }

  return (
    <Card
      className={cn(
        "h-full w-full overflow-hidden text-xs shadow-sm transition-all duration-150 hover:shadow-lg md:text-sm",
        "group relative flex flex-col justify-between",
        isConflicted ?
          "border-destructive bg-destructive/10 hover:bg-destructive/20"
        : "border-border hover:border-primary/50",
        isSelected ?
          "ring-primary bg-primary/5 !border-primary/70 ring-2 ring-offset-1"
        : "",
        isGhost ?
          "pointer-events-none border-blue-300 bg-blue-100/50 opacity-60"
        : "cursor-pointer",
        className,
      )}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick()
        if (e.key === "Enter" && e.ctrlKey) handleCardDoubleClick()
      }}
    >
      {/* Action buttons - absolutely positioned top-right, appear on hover */}
      {(onEdit || onDelete) && (
        <div className="bg-card/80 absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-sm p-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              aria-label="Editar Alocação"
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-6 w-6 p-0"
              onClick={handleDeleteClick}
              aria-label="Excluir Alocação"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <CardContent className="flex flex-grow flex-col space-y-0.5 p-1.5 leading-tight">
        {/* Drag Handle - Placeholder, actual DND later */}
        {/* <GripVertical className="absolute top-1 left-1 h-3 w-3 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" /> */}

        <div
          title={disciplinaNome}
          className="flex items-center"
        >
          <BookOpen className="text-muted-foreground mr-1 h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5" />
          <p className="truncate font-semibold">{disciplinaNome}</p>
        </div>
        <div
          title={turmaCodigo}
          className="flex items-center"
        >
          <UsersIcon className="text-muted-foreground mr-1 h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5" />
          <p className="text-muted-foreground truncate text-[0.7rem] md:text-xs">
            {turmaCodigo}
          </p>
        </div>
        {alocacao.turma?.professorAlocado && (
          <div
            title={professorNome}
            className="flex items-center"
          >
            <UserIcon className="text-muted-foreground mr-1 h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5" />
            <p className="text-muted-foreground truncate text-[0.7rem] md:text-xs">
              {professorPrimeiroNome}
            </p>
          </div>
        )}
        <div
          title={`${alocacao.horaInicio} - ${alocacao.horaFim}`}
          className="flex items-center"
        >
          <Clock className="text-muted-foreground mr-1 h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5" />
          <p className="text-muted-foreground text-[0.7rem] md:text-xs">
            {alocacao.horaInicio} - {alocacao.horaFim}
          </p>
        </div>

        {isConflicted && (
          <div className="mt-auto pt-1">
            <Badge
              variant="destructive"
              className="w-full items-center justify-center px-1 py-0.5 text-[0.65rem] md:text-xs"
            >
              <AlertTriangle className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
              Conflito
            </Badge>
          </div>
        )}
      </CardContent>

      {disciplinaCodigo && (
        <div className="mt-auto px-1.5 pb-1">
          <Badge
            variant="secondary"
            className="px-1 py-0 text-[0.65rem] md:text-xs"
          >
            {disciplinaCodigo}
          </Badge>
        </div>
      )}
    </Card>
  )
}

// Export the memoized component
export const AlocacaoBlock = React.memo(AlocacaoBlockComponent)

export default AlocacaoBlock
