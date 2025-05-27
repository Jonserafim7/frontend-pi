import { useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { User, BookOpen, CheckCircle2, AlertCircle } from "lucide-react"

import { type AlocacaoDisplay } from "../types"

interface DroppableSlotProps {
  slotId: string
  alocacao?: AlocacaoDisplay
}

export function DroppableSlot({ slotId, alocacao }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: {
      slotId,
      alocacao,
    },
  })

  const getSlotStyles = () => {
    if (alocacao) {
      // Slot ocupado
      if (isOver) {
        return "bg-primary/20 border-2 border-primary shadow-lg scale-105"
      }
      return "bg-primary/10 border border-primary/20 shadow-sm hover:shadow-md"
    }

    if (isOver) {
      // Hover em slot vazio - validação visual
      return "bg-green-500/10 border-2 border-green-500/30 shadow-lg scale-105"
    }

    // Slot vazio normal
    return "bg-muted/50 border border-border hover:border-border/70 hover:bg-muted/70 transition-all duration-200"
  }

  return (
    <div
      ref={setNodeRef}
      className={`relative h-20 w-full rounded-xl transition-all duration-300 ${getSlotStyles()} `}
    >
      {
        alocacao ?
          // Slot com alocação
          <div className="flex h-full flex-col justify-between p-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1">
                  <BookOpen className="text-primary h-3 w-3 flex-shrink-0" />
                  <span className="text-primary truncate text-sm font-bold">
                    {alocacao.turma.codigo}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                  <span className="text-muted-foreground truncate text-xs">
                    {alocacao.turma.professor}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
            </div>

            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary self-start text-xs"
            >
              {alocacao.turma.disciplina.length > 15 ?
                `${alocacao.turma.disciplina.substring(0, 15)}...`
              : alocacao.turma.disciplina}
            </Badge>
          </div>
          // Slot vazio
        : <div className="flex h-full items-center justify-center">
            {isOver ?
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Soltar aqui
                </span>
              </div>
            : <div className="text-center transition-opacity hover:opacity-100">
                <div className="border-accent-foreground/40 mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed">
                  <div className="bg-accent-foreground/40 h-2 w-2 rounded-full"></div>
                </div>
                <span className="text-accent-foreground/40 text-xs">Vazio</span>
              </div>
            }
          </div>

      }

      {/* Indicador de conflito (se houver) */}
      {isOver && alocacao && (
        <div className="absolute -top-1 -right-1">
          <div className="bg-destructive flex h-6 w-6 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive-foreground h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  )
}
