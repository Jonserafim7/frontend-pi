import type { ReactNode } from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { DragOverlay } from "@/features/alocacoes-horarios/components/dnd/DragOverlay"
import { useDragAndDrop } from "@/features/alocacoes-horarios/hooks/useDragAndDrop"
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"
import type { GridCell } from "@/features/alocacoes-horarios/types"

interface DndProviderProps {
  children: ReactNode
  onAlocacaoDrop: (turma: TurmaResponseDto, targetCell: GridCell) => void
}

export function DndProvider({ children, onAlocacaoDrop }: DndProviderProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before starting a drag
      // Useful to prevent drags accidentally interfering with clicks
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with a tolerance of 5px
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      // Configure keyboard sensor as needed
    }),
  )

  const {
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop({ onAlocacaoDrop })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay />
    </DndContext>
  )
}
