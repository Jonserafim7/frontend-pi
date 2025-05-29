import { useState, useCallback } from "react"
import type {
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  Active,
  Over,
} from "@dnd-kit/core"
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"
import type { GridCell } from "../types" // Assuming GridCell is here

// Define the structure for an item being dragged
export interface ActiveDragItemData {
  id: string
  type: "TURMA" | string // Add other types as needed, e.g., 'PROFESSOR_DISPONIBILIDADE'
  entityData: TurmaResponseDto | any // The actual data of the dragged item
  // Add any other relevant metadata from the draggable component
  sourceContainerId?: string // e.g., ID of the sidebar or original grid slot
}

// Define the structure for a droppable area that is being hovered over
export interface OverDropItemData {
  id: string
  type: "GRID_CELL" | string // Add other types as needed
  accepts: string[] // Types of draggable items this droppable accepts
  entityData: GridCell | any // The actual data of the droppable area
  // Add any other relevant metadata from the droppable component
}

interface UseDragAndDropProps {
  // Callback for when an allocation should be created or moved
  onAlocacaoDrop: (turma: TurmaResponseDto, targetCell: GridCell) => void
  // Add other callbacks as needed, e.g., onProfessorDisponibilidadeDrop
}

export function useDragAndDrop({ onAlocacaoDrop }: UseDragAndDropProps) {
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragItemData | null>(
    null,
  )
  const [overItem, setOverItem] = useState<OverDropItemData | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    // Assuming data passed to DraggableTurma's useDraggable is shaped like ActiveDragItemData
    const dragData = active.data.current as ActiveDragItemData | undefined
    if (dragData) {
      console.log("[DragStart]", dragData)
      setActiveDragItem(dragData)
    } else {
      console.warn("[DragStart] No data found on active draggable item", active)
      setActiveDragItem(null) // Explicitly set to null if no valid data
    }
    setOverItem(null) // Reset overItem on new drag start
  }, [])

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Optional: Logic during drag movement (e.g., for live validation previews)
    // console.log('[DragMove]', event.active.id, 'to', event.over?.id);
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (over && over.data.current) {
      const dropData = over.data.current as OverDropItemData | undefined
      if (dropData) {
        // console.log('[DragOver]', dropData);
        setOverItem(dropData)
      } else {
        setOverItem(null)
      }
    } else {
      setOverItem(null)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      console.log("[DragEnd]", {
        activeId: active.id,
        activeData: activeDragItem,
        overId: over?.id,
        overData: overItem,
      })

      if (activeDragItem && overItem) {
        // Example: Handle TURMA drop onto GRID_CELL
        if (
          activeDragItem.type === "TURMA" &&
          overItem.type === "GRID_CELL" &&
          overItem.accepts.includes("TURMA")
        ) {
          const turmaToDrop = activeDragItem.entityData as TurmaResponseDto
          const targetCell = overItem.entityData as GridCell

          if (turmaToDrop && targetCell) {
            console.log(
              `Attempting to drop Turma ${turmaToDrop.idDisciplinaOfertada} onto Cell ${targetCell.dia}-${targetCell.timeSlot.inicio}`,
            )
            onAlocacaoDrop(turmaToDrop, targetCell)
          } else {
            console.warn("[DragEnd] Missing Turma or Cell data for drop.")
          }
        }
        // Add other drop logic combinations here
      }

      // Reset states post-drag
      setActiveDragItem(null)
      setOverItem(null)
    },
    [activeDragItem, overItem, onAlocacaoDrop],
  )

  const handleDragCancel = useCallback(() => {
    console.log("[DragCancel]")
    setActiveDragItem(null)
    setOverItem(null)
  }, [])

  return {
    activeDragItem,
    overItem,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
