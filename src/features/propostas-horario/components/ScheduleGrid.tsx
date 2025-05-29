import * as React from "react"
import { cn } from "@/lib/utils"
import type {
  ConfiguracaoHorarioDto,
  AulaHorarioDto,
} from "@/api-generated/model"

// Types for schedule data
export interface ScheduleAllocation {
  id: string | number
  courseName: string
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"
  startTime: string // formato "HH:MM"
  endTime: string // formato "HH:MM"
  professorName?: string
  location?: string
  color?: string // cor customizada para o curso
}

export interface ScheduleGridConfig {
  startTime: string // formato "HH:MM", ex: "07:00"
  endTime: string // formato "HH:MM", ex: "23:00"
  timeSlotDuration: number // duração em minutos, ex: 60
  daysOfWeek: ScheduleAllocation["dayOfWeek"][]
  showWeekends?: boolean
}

// Type for the information passed on slot click
export interface ScheduleSlotClickInfo {
  day: ScheduleAllocation["dayOfWeek"]
  startTime: string
  endTime: string
  turno: "manha" | "tarde" | "noite"
}

interface ScheduleGridProps {
  allocations?: ScheduleAllocation[]
  config?: Partial<ScheduleGridConfig>
  configuracaoHorario: ConfiguracaoHorarioDto
  className?: string
  onSlotClick?: (slotInfo: ScheduleSlotClickInfo) => void
}

// Default configuration
const DEFAULT_CONFIG: ScheduleGridConfig = {
  startTime: "07:00",
  endTime: "23:00",
  timeSlotDuration: 60,
  daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  showWeekends: false,
}

// Utility functions for time calculations
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

const generateTimeSlots = (
  startTime: string,
  endTime: string,
  duration: number,
): string[] => {
  const startMinutes = parseTime(startTime)
  const endMinutes = parseTime(endTime)
  const slots: string[] = []

  for (let time = startMinutes; time < endMinutes; time += duration) {
    slots.push(formatTime(time))
  }

  return slots
}

// Day names in Portuguese
const DAY_LABELS: Record<ScheduleAllocation["dayOfWeek"], string> = {
  Monday: "Segunda",
  Tuesday: "Terça",
  Wednesday: "Quarta",
  Thursday: "Quinta",
  Friday: "Sexta",
  Saturday: "Sábado",
  Sunday: "Domingo",
}

// Utility function to generate class slots from ConfiguracaoHorarioDto (removed React.memo)
const generateClassSlotsFromConfig = (
  configHorario: ConfiguracaoHorarioDto,
): Array<{ inicio: string; fim: string; turno: "manha" | "tarde" | "noite" }> => {
  const allSlots: Array<{
    inicio: string
    fim: string
    turno: "manha" | "tarde" | "noite"
  }> = []

  configHorario.aulasTurnoManha.forEach((aula) =>
    allSlots.push({ ...aula, turno: "manha" }),
  )
  configHorario.aulasTurnoTarde.forEach((aula) =>
    allSlots.push({ ...aula, turno: "tarde" }),
  )
  configHorario.aulasTurnoNoite.forEach((aula) =>
    allSlots.push({ ...aula, turno: "noite" }),
  )

  // Remove duplicates based on inicio and fim, and sort by inicio time
  const uniqueSlots = Array.from(
    new Map(
      allSlots.map((slot) => [`${slot.inicio}-${slot.fim}`, slot]),
    ).values(),
  )

  uniqueSlots.sort((a, b) => parseTime(a.inicio) - parseTime(b.inicio))

  return uniqueSlots
}

// Memoized individual cell component for better performance
const ScheduleCell = React.memo(
  ({
    day,
    classSlot,
    classSlotIndex,
    dayIndex,
    onSlotClick,
    onKeyDown,
  }: {
    day: ScheduleAllocation["dayOfWeek"]
    classSlot: { inicio: string; fim: string; turno: "manha" | "tarde" | "noite" }
    classSlotIndex: number
    dayIndex: number
    onSlotClick?: (slotInfo: ScheduleSlotClickInfo) => void
    onKeyDown: (
      event: React.KeyboardEvent,
      day: ScheduleAllocation["dayOfWeek"],
      classSlot: {
        inicio: string
        fim: string
        turno: "manha" | "tarde" | "noite"
      },
      classSlotIndex: number,
      dayIndex: number,
    ) => void
  }) => {
    const handleClick = React.useCallback(() => {
      if (onSlotClick) {
        onSlotClick({
          day,
          startTime: classSlot.inicio,
          endTime: classSlot.fim,
          turno: classSlot.turno,
        })
      }
    }, [onSlotClick, day, classSlot.inicio, classSlot.fim, classSlot.turno])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        onKeyDown(event, day, classSlot, classSlotIndex, dayIndex)
      },
      [onKeyDown, day, classSlot, classSlotIndex, dayIndex],
    )

    return (
      <div
        id={`schedule-cell-${day}-${classSlotIndex}`}
        data-slot="schedule-cell"
        data-day={day}
        data-time-start={classSlot.inicio}
        data-time-end={classSlot.fim}
        data-turno={classSlot.turno}
        style={{
          gridRowStart: classSlotIndex + 2,
          gridRowEnd: classSlotIndex + 3,
        }}
        className={cn(
          "relative min-h-[60px] border-r border-b p-2",
          "hover:bg-primary/10 active:bg-primary/20 cursor-pointer transition-colors",
          "focus:ring-primary focus:ring-2 focus:ring-offset-1 focus:outline-none",
          "flex items-center justify-center",
          classSlotIndex % 2 === 0 ? "bg-background" : "bg-muted/5",
        )}
        role="gridcell"
        tabIndex={0}
        aria-label={`Slot de horário para ${DAY_LABELS[day]}, ${classSlot.inicio} às ${classSlot.fim}, turno ${classSlot.turno}. Pressione Enter ou Espaço para selecionar.`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Content for this cell: allocations that fall into this day and classSlot */}
        {/* Placeholder para futuras alocações */}
        <div className="text-muted-foreground/50 text-center text-xs">
          Clique para alocar
        </div>
      </div>
    )
  },
)

ScheduleCell.displayName = "ScheduleCell"

const ScheduleGrid = React.memo(
  ({
    allocations = [],
    config = {},
    configuracaoHorario,
    className,
    onSlotClick,
  }: ScheduleGridProps) => {
    const finalConfig = React.useMemo(
      () => ({ ...DEFAULT_CONFIG, ...config }),
      [config],
    )

    // Memoize expensive calculations
    const classSlots = React.useMemo(
      () => generateClassSlotsFromConfig(configuracaoHorario),
      [configuracaoHorario],
    )

    const daysToShow = React.useMemo(
      () =>
        finalConfig.showWeekends ?
          finalConfig.daysOfWeek
        : finalConfig.daysOfWeek.filter(
            (day) => !["Saturday", "Sunday"].includes(day),
          ),
      [finalConfig.showWeekends, finalConfig.daysOfWeek],
    )

    // Memoize keyboard navigation handler
    const handleKeyDown = React.useCallback(
      (
        event: React.KeyboardEvent,
        day: ScheduleAllocation["dayOfWeek"],
        classSlot: {
          inicio: string
          fim: string
          turno: "manha" | "tarde" | "noite"
        },
        classSlotIndex: number,
        dayIndex: number,
      ) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          if (onSlotClick) {
            onSlotClick({
              day,
              startTime: classSlot.inicio,
              endTime: classSlot.fim,
              turno: classSlot.turno,
            })
          }
        }

        // Arrow key navigation
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
        ) {
          event.preventDefault()

          let newClassSlotIndex = classSlotIndex
          let newDayIndex = dayIndex

          switch (event.key) {
            case "ArrowUp":
              newClassSlotIndex = Math.max(0, classSlotIndex - 1)
              break
            case "ArrowDown":
              newClassSlotIndex = Math.min(
                classSlots.length - 1,
                classSlotIndex + 1,
              )
              break
            case "ArrowLeft":
              newDayIndex = Math.max(0, dayIndex - 1)
              break
            case "ArrowRight":
              newDayIndex = Math.min(daysToShow.length - 1, dayIndex + 1)
              break
          }

          // Focus the new cell
          const newCellId = `schedule-cell-${daysToShow[newDayIndex]}-${newClassSlotIndex}`
          const newCell = document.getElementById(newCellId)
          if (newCell) {
            newCell.focus()
          }
        }
      },
      [onSlotClick, classSlots.length, daysToShow],
    )

    // Memoize grid template styles
    const gridTemplateColumns = React.useMemo(
      () => `100px repeat(${daysToShow.length}, minmax(120px, 1fr))`,
      [daysToShow.length],
    )

    const gridTemplateRows = React.useMemo(
      () => `auto repeat(${classSlots.length}, minmax(60px, auto))`,
      [classSlots.length],
    )

    return (
      <div
        data-slot="schedule-grid"
        className={cn(
          "bg-background relative w-full overflow-x-auto rounded-lg border shadow-sm",
          className,
        )}
        role="grid"
        aria-label="Grade de horários semanal"
      >
        {/* Grid Container */}
        <div
          data-slot="schedule-grid-container"
          className="grid min-w-fit"
          style={{
            gridTemplateColumns,
            gridTemplateRows,
          }}
        >
          {/* Header Row */}
          {/* Empty corner cell */}
          <div
            data-slot="grid-corner"
            className="bg-muted/50 sticky top-0 z-20 border-r border-b p-3 text-center text-xs font-medium"
            role="columnheader"
            aria-label="Horário"
          >
            Horário
          </div>

          {/* Day Headers */}
          {daysToShow.map((day, dayIndex) => (
            <div
              key={day}
              data-slot="day-header"
              className="bg-muted/50 sticky top-0 z-10 border-r border-b p-3 text-center text-sm font-medium"
              role="columnheader"
              aria-label={`Dia da semana: ${DAY_LABELS[day]}`}
            >
              {DAY_LABELS[day]}
            </div>
          ))}

          {/* Grid Cells based on Class Slots */}
          {classSlots.map((classSlot, classSlotIndex) => (
            <React.Fragment
              key={`class_slot_row_${classSlot.inicio}_${classSlot.fim}`}
            >
              {/* Class Slot Time Label */}
              <div
                data-slot="class-slot-time-label"
                style={{
                  gridRowStart: classSlotIndex + 2,
                  gridRowEnd: classSlotIndex + 3,
                }}
                className="bg-muted/20 sticky left-0 z-10 flex flex-col items-center justify-center border-r border-b p-2 text-center text-xs font-medium"
                role="rowheader"
                aria-label={`Horário da aula: ${classSlot.inicio} às ${classSlot.fim}, turno ${classSlot.turno}`}
              >
                <span className="text-xs font-semibold">{classSlot.inicio}</span>
                <span className="text-muted-foreground text-[10px]">às</span>
                <span className="text-xs font-semibold">{classSlot.fim}</span>
                <span className="text-muted-foreground mt-1 text-[9px] capitalize">
                  {classSlot.turno}
                </span>
              </div>

              {/* Day Cells for this Class Slot */}
              {daysToShow.map((day, dayIndex) => (
                <ScheduleCell
                  key={`${day}-${classSlot.inicio}-${classSlot.fim}`}
                  day={day}
                  classSlot={classSlot}
                  classSlotIndex={classSlotIndex}
                  dayIndex={dayIndex}
                  onSlotClick={onSlotClick}
                  onKeyDown={handleKeyDown}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  },
)

ScheduleGrid.displayName = "ScheduleGrid"

export { ScheduleGrid, ScheduleCell }
