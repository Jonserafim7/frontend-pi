import { BookOpen, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { type TurmaDisplay } from "../types"

interface DraggedTurmaOverlayProps {
  turma: TurmaDisplay
}

export function DraggedTurmaOverlay({ turma }: DraggedTurmaOverlayProps) {
  return (
    <div className="relative">
      <div className="scale-110 rotate-3 rounded-xl border-2 border-primary bg-card p-4 shadow-2xl backdrop-blur-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-foreground">
              {turma.codigo}
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 text-primary"
          >
            {turma.aulasAlocadas}/{turma.cargaHorariaSemanal}
          </Badge>
        </div>

        <p className="mb-1 text-sm font-medium text-foreground">
          {turma.disciplina}
        </p>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{turma.professor}</span>
        </div>
      </div>

      {/* Efeito de brilho */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-xl"></div>
    </div>
  )
}
