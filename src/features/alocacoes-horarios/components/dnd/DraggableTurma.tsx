import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { TurmaCard } from "../sidebar/TurmaCard"
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"

// Remove placeholder TurmaCardProps and TurmaCard component
// interface TurmaCardProps { ... }
// const TurmaCard: React.FC<TurmaCardProps> = ({ turma }) => { ... };

interface DraggableTurmaProps {
  id: string // Unique ID for the draggable item
  turma: TurmaResponseDto // Use TurmaResponseDto for turma data
  // Add any other props TurmaCard might expect or that DraggableTurma needs
  compact?: boolean
  isSelected?: boolean
  onClick?: (turma: TurmaResponseDto) => void
  onShowDetails?: (turma: TurmaResponseDto) => void
  className?: string
}

export function DraggableTurma({ id, turma, ...rest }: DraggableTurmaProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
      data: {
        // Pass turma data to be accessible in DndContext event handlers
        turma,
        type: "TURMA", // Add a type for easy identification in drop logic
      },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? "grabbing" : "grab",
    // Add more styles for visual feedback during drag if needed
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TurmaCard
        turma={turma}
        isDragging={isDragging}
        {...rest}
      />
    </div>
  )
}
