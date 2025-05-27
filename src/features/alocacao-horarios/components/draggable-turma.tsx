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

import { type TurmaDisplay } from "../types"

interface DraggableTurmaProps {
  turma: TurmaDisplay
}

export function DraggableTurma({ turma }: DraggableTurmaProps) {
  const isDisabled = turma.status === "sem-professor"

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: turma.id,
      disabled: isDisabled,
      data: turma,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
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
          icon: <BookOpen className="h-4 w-4 text-primary" />,
          badge: {
            variant: "outline" as const,
            className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
          },
        }
      case "sem-professor":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive/20",
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
          badge: {
            variant: "destructive" as const,
            className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
          },
        }
      default:
        return {
          bg: "bg-muted",
          border: "border-border",
          icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
          badge: {
            variant: "outline" as const,
            className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
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
      className={`group relative cursor-grab rounded-xl border p-4 transition-all duration-300 active:cursor-grabbing ${statusConfig.bg} ${statusConfig.border} ${isDragging ? "scale-105 rotate-2 shadow-2xl ring-4 ring-primary/30" : "hover:scale-[1.02] hover:shadow-lg"} ${isDisabled ? "cursor-not-allowed opacity-60" : ""} `}
    >
      {/* Header com código e status */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <h3 className="text-lg font-bold text-foreground">{turma.codigo}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge {...statusConfig.badge}>
            {turma.aulasAlocadas}/{turma.cargaHorariaSemanal}
          </Badge>
          {!isDisabled && (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical className="h-4 w-4 text-muted-foreground/70" />
            </div>
          )}
        </div>
      </div>

      {/* Disciplina */}
      <div className="mb-3">
        <p className="mb-1 text-sm font-medium text-foreground">
          {turma.disciplina}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{turma.professor}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso das aulas</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2 bg-muted"
        />
      </div>

      {/* Indicador de drag */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/20">
          <div className="rounded-full bg-background/90 px-3 py-1 text-sm font-medium text-primary">
            Arrastando...
          </div>
        </div>
      )}
    </div>
  )
}
