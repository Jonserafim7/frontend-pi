import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { memo } from "react"

import { type TurmaDisplay } from "../types"

interface DraggableTurmaProps {
  turma: TurmaDisplay
}

export const DraggableTurma = memo(({ turma }: DraggableTurmaProps) => {
  const isDisabled = turma.status === "sem-professor"

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: turma.id,
      disabled: isDisabled,
      data: turma,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    // Reduzir animações durante drag para melhor performance
    transition: isDragging ? "none" : "all 200ms ease-out",
  }

  const getStatusConfig = () => {
    switch (turma.status) {
      case "completa":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          badge: {
            variant: "default" as const,
            className: "bg-green-600/10 text-green-700 hover:bg-green-600/20",
          },
        }
      case "parcial":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          badge: {
            variant: "secondary" as const,
            className: "bg-yellow-600/10 text-yellow-700 hover:bg-yellow-600/20",
          },
        }
      case "nao-alocada":
        return {
          bg: "bg-primary/10",
          border: "border-primary/20",
          icon: <BookOpen className="text-primary h-4 w-4" />,
          badge: {
            variant: "outline" as const,
            className:
              "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
          },
        }
      case "sem-professor":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive/20",
          icon: <AlertTriangle className="text-destructive h-4 w-4" />,
          badge: {
            variant: "destructive" as const,
            className:
              "bg-destructive/10 text-destructive hover:bg-destructive/20",
          },
        }
      default:
        return {
          bg: "bg-muted",
          border: "border-border",
          icon: <BookOpen className="text-muted-foreground h-4 w-4" />,
          badge: {
            variant: "outline" as const,
            className:
              "bg-muted text-muted-foreground border-border hover:bg-muted/80",
          },
        }
    }
  }

  const statusConfig = getStatusConfig()
  const progressPercentage =
    (turma.aulasAlocadas / turma.cargaHorariaSemanal) * 100

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-dnd-draggable="true"
      className={`group draggable-turma relative cursor-grab rounded-xl border p-4 select-none ${statusConfig.bg} ${statusConfig.border} ${
        isDragging ?
          "ring-primary/30 pointer-events-none scale-[0.98] shadow-xl ring-2"
        : "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      } ${isDisabled ? "cursor-not-allowed opacity-60" : ""} `}
    >
      {/* Header com código e status */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <h3 className="text-foreground text-lg font-bold">{turma.codigo}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge {...statusConfig.badge}>
            {turma.aulasAlocadas}/{turma.cargaHorariaSemanal}
          </Badge>
          {!isDisabled && (
            <div className="opacity-50 transition-opacity group-hover:opacity-100">
              <GripVertical className="text-muted-foreground/70 h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      {/* Disciplina */}
      <div className="mb-3">
        <p className="text-foreground mb-1 truncate text-sm font-medium">
          {turma.disciplina}
        </p>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{turma.professor}</span>
        </div>
      </div>

      {/* Progress bar - Simplificado para melhor performance */}
      <div className="space-y-2">
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>Progresso</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              turma.status === "completa" ? "bg-green-500"
              : turma.status === "parcial" ? "bg-yellow-500"
              : turma.status === "nao-alocada" ? "bg-primary"
              : "bg-destructive"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Indicador visual reduzido durante drag */}
      {isDragging && (
        <div className="bg-primary/10 border-primary/30 absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed">
          <div className="bg-primary/20 text-primary rounded-lg px-2 py-1 text-xs font-medium backdrop-blur-sm">
            Arrastando
          </div>
        </div>
      )}
    </div>
  )
})

DraggableTurma.displayName = "DraggableTurma"
