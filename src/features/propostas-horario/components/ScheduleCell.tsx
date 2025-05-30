import React from "react"
import { cn } from "@/lib/utils"

interface ScheduleCellProps {
  day: string
  classSlot: { inicio: string; fim: string; turno: "manha" | "tarde" | "noite" }
  classSlotIndex: number
  dayIndex: number
  onSlotClick?: (slotInfo: {
    day: string
    startTime: string
    endTime: string
    turno: "manha" | "tarde" | "noite"
  }) => void
  onKeyDown: (
    event: React.KeyboardEvent,
    day: string,
    classSlot: {
      inicio: string
      fim: string
      turno: "manha" | "tarde" | "noite"
    },
    classSlotIndex: number,
    dayIndex: number,
  ) => void
  className?: string
}

/**
 * Componente individual de célula do grid de horários
 */
export const ScheduleCell = React.memo(
  ({
    day,
    classSlot,
    classSlotIndex,
    dayIndex,
    onSlotClick,
    onKeyDown,
    className,
  }: ScheduleCellProps) => {
    const handleClick = () => {
      onSlotClick?.({
        day,
        startTime: classSlot.inicio,
        endTime: classSlot.fim,
        turno: classSlot.turno,
      })
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      onKeyDown(event, day, classSlot, classSlotIndex, dayIndex)
    }

    return (
      <div
        id={`schedule-cell-${day}-${classSlotIndex}`}
        className={cn(
          "relative min-h-[60px] cursor-pointer p-2",
          "border-border border-r border-b last:border-r-0",
          "bg-background transition-colors duration-200",
          "hover:bg-muted/50 focus:bg-muted/70",
          "focus:ring-primary/20 focus:ring-2 focus:outline-none",
          "focus:border-primary/50",
          className,
        )}
        role="gridcell"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Slot de ${classSlot.turno} ${day} das ${classSlot.inicio} às ${classSlot.fim}`}
      >
        {/* Conteúdo da célula - placeholder para futuras alocações */}
        <div className="h-full w-full" />
      </div>
    )
  },
)
