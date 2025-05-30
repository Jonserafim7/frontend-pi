import React, { useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { ConfiguracaoHorarioDto } from "@/api-generated/model"
import { ScheduleCell } from "./ScheduleCell"

interface ScheduleGridProps {
  /** Configuração de horário com slots de aula */
  configuracaoHorario: ConfiguracaoHorarioDto
  /** Callback quando um slot é clicado */
  onSlotClick?: (slotInfo: {
    day: string
    startTime: string
    endTime: string
    turno: "manha" | "tarde" | "noite"
  }) => void
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente de grid de horários para alocação de turmas
 */
export const ScheduleGrid = React.memo(
  ({ configuracaoHorario, onSlotClick, className }: ScheduleGridProps) => {
    // Dias da semana
    const daysToShow = useMemo(
      () => ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
      [],
    )

    // Processar slots de aula da configuração
    const classSlots = useMemo(() => {
      const slots: Array<{
        inicio: string
        fim: string
        turno: "manha" | "tarde" | "noite"
      }> = []

      // Adicionar slots da manhã
      if (configuracaoHorario.aulasTurnoManha) {
        configuracaoHorario.aulasTurnoManha.forEach((slot) => {
          slots.push({ ...slot, turno: "manha" })
        })
      }

      // Adicionar slots da tarde
      if (configuracaoHorario.aulasTurnoTarde) {
        configuracaoHorario.aulasTurnoTarde.forEach((slot) => {
          slots.push({ ...slot, turno: "tarde" })
        })
      }

      // Adicionar slots da noite
      if (configuracaoHorario.aulasTurnoNoite) {
        configuracaoHorario.aulasTurnoNoite.forEach((slot) => {
          slots.push({ ...slot, turno: "noite" })
        })
      }

      return slots
    }, [configuracaoHorario])

    // Estilos do grid
    const gridStyles = useMemo(
      () => ({
        gridTemplateColumns: `120px repeat(${daysToShow.length}, 1fr)`,
        gridTemplateRows: `auto repeat(${classSlots.length}, minmax(60px, auto))`,
      }),
      [daysToShow.length, classSlots.length],
    )

    // Handler de navegação por teclado
    const handleKeyDown = useCallback(
      (
        event: React.KeyboardEvent,
        day: string,
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
          onSlotClick?.({
            day,
            startTime: classSlot.inicio,
            endTime: classSlot.fim,
            turno: classSlot.turno,
          })
        } else if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
        ) {
          event.preventDefault()
          let newDayIndex = dayIndex
          let newClassSlotIndex = classSlotIndex

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

          const targetElement = document.getElementById(
            `schedule-cell-${daysToShow[newDayIndex]}-${newClassSlotIndex}`,
          )
          targetElement?.focus()
        }
      },
      [onSlotClick, classSlots.length, daysToShow],
    )

    return (
      <div className={cn("overflow-x-auto", className)}>
        <div
          className={cn(
            "grid min-w-fit gap-0",
            "border-border bg-background border",
            "overflow-hidden rounded-lg",
          )}
          style={gridStyles}
          role="grid"
          aria-label="Grade de horários para alocação de turmas"
        >
          {/* Cabeçalho vazio (canto superior esquerdo) */}
          <div
            className={cn(
              "sticky top-0 left-0 z-[1] p-3",
              "border-border border-r border-b",
              "bg-muted/50",
            )}
          >
            <span className="text-muted-foreground text-sm font-medium">
              Horário
            </span>
          </div>

          {/* Cabeçalhos dos dias */}
          {daysToShow.map((day) => (
            <div
              key={day}
              className={cn(
                "sticky top-0 z-[1] p-3 text-center",
                "border-border border-r border-b last:border-r-0",
                "bg-muted/50",
              )}
            >
              <span className="text-foreground text-sm font-medium">{day}</span>
            </div>
          ))}

          {/* Linhas de horário */}
          {classSlots.map((classSlot, classSlotIndex) => (
            <React.Fragment key={`${classSlot.inicio}-${classSlot.fim}`}>
              {/* Célula de horário (primeira coluna) */}
              <div
                className={cn(
                  "sticky left-0 z-[1] p-3",
                  "border-border border-r border-b",
                  "bg-muted/30",
                )}
              >
                <div className="text-foreground text-xs font-medium">
                  {classSlot.inicio}
                </div>
                <div className="text-muted-foreground text-xs">
                  {classSlot.fim}
                </div>
                <div className="text-muted-foreground/70 mt-1 text-xs capitalize">
                  {classSlot.turno}
                </div>
              </div>

              {/* Células de cada dia */}
              {daysToShow.map((day, dayIndex) => (
                <ScheduleCell
                  key={`${day}-${classSlotIndex}`}
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
