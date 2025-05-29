import * as React from "react"
import { cn } from "@/lib/utils"

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

interface ScheduleGridProps {
  allocations?: ScheduleAllocation[]
  config?: Partial<ScheduleGridConfig>
  className?: string
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

function ScheduleGrid({
  allocations = [],
  config = {},
  className,
}: ScheduleGridProps) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const timeSlots = generateTimeSlots(
    finalConfig.startTime,
    finalConfig.endTime,
    finalConfig.timeSlotDuration,
  )

  const daysToShow =
    finalConfig.showWeekends ?
      finalConfig.daysOfWeek
    : finalConfig.daysOfWeek.filter(
        (day) => !["Saturday", "Sunday"].includes(day),
      )

  return (
    <div
      data-slot="schedule-grid"
      className={cn(
        "bg-background relative w-full overflow-x-auto rounded-lg border shadow-sm",
        className,
      )}
    >
      {/* Grid Container */}
      <div
        data-slot="schedule-grid-container"
        className="grid min-w-fit"
        style={{
          gridTemplateColumns: `80px repeat(${daysToShow.length}, minmax(120px, 1fr))`,
          gridTemplateRows: `auto repeat(${timeSlots.length}, minmax(60px, auto))`,
        }}
      >
        {/* Header Row */}
        {/* Empty corner cell */}
        <div
          data-slot="grid-corner"
          className="bg-muted/50 sticky top-0 z-20 border-r border-b p-2"
        />

        {/* Day Headers */}
        {daysToShow.map((day) => (
          <div
            key={day}
            data-slot="day-header"
            className="bg-muted/50 sticky top-0 z-10 border-r border-b p-2 text-center text-sm font-medium"
          >
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Time Slots and Grid Cells */}
        {timeSlots.map((timeSlot, timeIndex) => (
          <React.Fragment key={timeSlot}>
            {/* Time Label */}
            <div
              data-slot="time-label"
              className="bg-muted/20 sticky left-0 z-10 flex items-center justify-center border-r border-b p-2 text-center text-xs font-medium"
            >
              {timeSlot}
            </div>

            {/* Day Cells for this time slot */}
            {daysToShow.map((day) => (
              <div
                key={`${day}-${timeSlot}`}
                data-slot="schedule-cell"
                data-day={day}
                data-time={timeSlot}
                className={cn(
                  "relative min-h-[60px] border-r border-b p-1",
                  "hover:bg-muted/30 transition-colors",
                  // Zebra striping for better readability
                  timeIndex % 2 === 0 ? "bg-background" : "bg-muted/10",
                )}
              >
                {/* Placeholder for future course allocations */}
                {/* This cell will be populated in the next subtask */}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Grid Cell component for individual schedule cells
function ScheduleCell({
  day,
  timeSlot,
  allocation,
  className,
}: {
  day: ScheduleAllocation["dayOfWeek"]
  timeSlot: string
  allocation?: ScheduleAllocation
  className?: string
}) {
  return (
    <div
      data-slot="schedule-cell-content"
      className={cn("relative h-full min-h-[60px] w-full p-1", className)}
    >
      {allocation && (
        <div
          data-slot="allocation-content"
          className="bg-primary/10 border-primary/20 h-full w-full rounded border p-1 text-xs"
        >
          <div className="truncate font-medium">{allocation.courseName}</div>
          {allocation.professorName && (
            <div className="text-muted-foreground truncate">
              {allocation.professorName}
            </div>
          )}
          {allocation.location && (
            <div className="text-muted-foreground truncate">
              {allocation.location}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { ScheduleGrid, ScheduleCell }
