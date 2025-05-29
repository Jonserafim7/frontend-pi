import React from "react"
import { DragOverlay as DndKitDragOverlay, useDndContext } from "@dnd-kit/core"
import { TurmaCard } from "../sidebar/TurmaCard"
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"

interface ActiveDragItem {
  id: string
  type: string // e.g., 'TURMA', 'PROFESSOR_DISPONIBILIDADE_ITEM'
  data?: any // The actual data of the item being dragged
}

export function DragOverlay() {
  const { active } = useDndContext()

  const activeDragItem = active?.data.current as ActiveDragItem | undefined

  if (!active || !activeDragItem) {
    return null
  }

  let overlayContent = null

  switch (activeDragItem.type) {
    case "TURMA":
      // Assuming activeDragItem.data contains the TurmaResponseDto
      const turmaData = activeDragItem.data as TurmaResponseDto
      if (turmaData) {
        overlayContent = (
          <TurmaCard
            turma={turmaData}
            isDragging={true} // Indicate that this is a dragged preview
            // Example of className for overlay specific styles:
            // className="opacity-75 shadow-xl cursor-grabbing"
            // Removed style={{ pointerEvents: "none" }} - pointerEvents can be handled by DndKitDragOverlay itself or global CSS
          />
        )
      }
      break
    // Add cases for other draggable types if needed
    // case 'OTHER_TYPE':
    //   overlayContent = <OtherDraggablePreview data={activeDragItem.data} />;
    //   break;
    default:
      console.warn("Unknown draggable type in DragOverlay:", activeDragItem.type)
      break
  }

  return <DndKitDragOverlay>{overlayContent}</DndKitDragOverlay>
}
