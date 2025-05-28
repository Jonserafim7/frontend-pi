import { BookOpen, User, GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { type TurmaDisplay } from "../types"

interface DraggedTurmaOverlayProps {
  turma: TurmaDisplay
}

export function DraggedTurmaOverlay({ turma }: DraggedTurmaOverlayProps) {
  return (
    <div className="dnd-overlay pointer-events-none relative">
      {/* Versão compacta do card - similar ao tamanho do slot */}
      <div className="border-primary dnd-shadow h-16 w-48 scale-105 rotate-2 rounded-lg border-2 bg-white/95 shadow-xl backdrop-blur-sm">
        <div className="flex h-full items-center justify-between p-2">
          {/* Conteúdo principal */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-1">
              <BookOpen className="text-primary h-3 w-3 flex-shrink-0" />
              <span className="text-primary truncate text-sm font-bold">
                {turma.codigo}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="text-muted-foreground h-2.5 w-2.5 flex-shrink-0" />
              <span className="text-muted-foreground truncate text-xs">
                {turma.professor}
              </span>
            </div>
          </div>

          {/* Badge compacto e grip */}
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary h-4 px-1 text-xs"
            >
              {turma.aulasAlocadas}/{turma.cargaHorariaSemanal}
            </Badge>
            <GripVertical className="text-muted-foreground/50 h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Efeito de brilho sutil */}
      <div className="bg-primary/10 absolute inset-0 -z-10 rounded-lg blur-sm"></div>

      {/* Cursor personalizado */}
      <div className="bg-primary absolute -top-1 -left-1 h-3 w-3 animate-pulse rounded-full shadow-lg"></div>
    </div>
  )
}
