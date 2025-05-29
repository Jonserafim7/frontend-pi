import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { HorarioSlot } from "../grid/HorarioSlot" // Assuming HorarioSlot is in this path
import type { GridCell, GridInteraction } from "../../types" // Assuming GridCell and GridInteraction types are here

interface DroppableSlotProps {
  id: string // Unique ID for the droppable area, e.g., `dia-horaInicio`
  cellData: GridCell // Data for the grid cell this droppable represents
  onInteraction: (interaction: GridInteraction) => void // Made non-optional and typed
  position: { row: number; col: number } // Made non-optional
  // Add any other props HorarioSlot might expect or that DroppableSlot needs
}

export function DroppableSlot({
  id,
  cellData,
  onInteraction,
  position,
}: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "GRID_CELL", // Type of the droppable area
      accepts: ["TURMA"], // What type of draggable items this slot accepts
      cell: cellData, // Pass the cell data for context in drop handlers
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ height: "100%", width: "100%" }}
    >
      <HorarioSlot
        cell={cellData}
        isDropTarget={true} // Indicate that this slot is a potential drop target
        isDragOver={isOver} // Pass the isOver state from useDroppable
        onInteraction={onInteraction} // Pass directly
        position={position} // Pass directly
      />
    </div>
  )
}
