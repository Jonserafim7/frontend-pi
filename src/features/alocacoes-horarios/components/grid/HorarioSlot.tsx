import React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  User,
  BookOpen,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"

import type { HorarioSlotProps, GridInteraction } from "../../types"
import { AlocacaoBlock } from "./AlocacaoBlock"

/**
 * Individual time slot component that can contain an allocation or be empty
 */
const HorarioSlotComponent: React.FC<HorarioSlotProps> = ({
  cell,
  position,
  isDropTarget,
  isDragOver,
  onInteraction,
}) => {
  const { dia, timeSlot, isEmpty, alocacao, isHighlighted, isConflicted } = cell

  // Placeholder handlers for AlocacaoBlock actions, to be fully implemented later
  const handleEditAlocacao = (clickedAlocacao: NonNullable<typeof alocacao>) => {
    console.log("Edit alocacao:", clickedAlocacao)
    // Actual implementation will involve calling a modal or service
    // For now, we can also propagate an interaction if needed, or handle directly
  }

  const handleDeleteAlocacao = (
    clickedAlocacao: NonNullable<typeof alocacao>,
  ) => {
    console.log("Delete alocacao:", clickedAlocacao)
    // Actual implementation will involve a confirmation and API call
  }

  // Unified click handler for the slot itself or the AlocacaoBlock
  const handleGenericClick = (event?: React.MouseEvent<HTMLDivElement>) => {
    // If alocacao exists, the click is on AlocacaoBlock, otherwise on the slot.
    // We can differentiate if needed, but for now, a general CLICK is fine.
    if (onInteraction) {
      const interactionPayload: GridInteraction = {
        type: "CLICK",
        cell,
        position,
        originalEvent: event,
      }
      onInteraction(interactionPayload)
    }
  }

  // Unified double-click handler
  const handleGenericDoubleClick = (event?: React.MouseEvent<HTMLDivElement>) => {
    if (onInteraction) {
      const interactionPayload: GridInteraction = {
        type: "DOUBLE_CLICK",
        cell,
        position,
        originalEvent: event,
      }
      onInteraction(interactionPayload)
    }
  }

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    const interaction: GridInteraction = {
      type: "DRAG_ENTER",
      cell,
      position,
      originalEvent: event,
    }
    onInteraction(interaction)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    const interaction: GridInteraction = {
      type: "DRAG_LEAVE",
      cell,
      position,
      originalEvent: event,
    }
    onInteraction(interaction)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const interaction: GridInteraction = {
      type: "DROP",
      cell,
      position,
      originalEvent: event,
    }
    onInteraction(interaction)
  }

  // Prevent default drag over to allow drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const slotBaseClasses = cn(
    "border-border relative flex h-full min-h-[60px] items-center justify-center border-b p-0.5 text-xs",
    position.col % 2 === 0 ? "bg-background" : "bg-muted/20",
    isHighlighted && "bg-primary/10",
    isDropTarget && "outline-dashed outline-1 outline-primary",
    isDragOver && "bg-primary/20 outline-solid outline-2 outline-primary",
    !alocacao && "hover:bg-secondary/30 transition-colors duration-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
  )

  return (
    <div
      className={slotBaseClasses}
      style={{
        borderRightWidth: "1px",
      }}
      onClick={handleGenericClick}
      onDoubleClick={handleGenericDoubleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="gridcell"
      aria-selected={!!alocacao}
      tabIndex={0}
    >
      {alocacao && !isEmpty ?
        <AlocacaoBlock
          alocacao={alocacao}
          cell={cell}
          isConflicted={isConflicted}
          onEdit={handleEditAlocacao}
          onDelete={handleDeleteAlocacao}
        />
      : <span className="sr-only">
          Vazio, {dia} {timeSlot.inicio}-{timeSlot.fim}
        </span>
      }
    </div>
  )
}

// Export the memoized component
export const HorarioSlot = React.memo(HorarioSlotComponent)

export default HorarioSlot
