import React, { useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import type {
  ConfiguracaoHorarioDto,
  AlocacaoHorarioResponseDto,
} from "@/api-generated/model"
import { ScheduleCell } from "./ScheduleCell"
import {
  processClassSlots,
  groupAllocationsByPosition,
} from "../utils/gridPositioning"

interface ScheduleGridProps {
  /** Configuração de horário com slots de aula */
  configuracaoHorario: ConfiguracaoHorarioDto
  /** Lista de alocações existentes para exibir no grid */
  alocacoes?: AlocacaoHorarioResponseDto[]
  /** Callback quando um slot é clicado */
  onSlotClick?: (slotInfo: {
    day: string
    startTime: string
    endTime: string
    turno: "manha" | "tarde" | "noite"
  }) => void
  /** Callback quando uma alocação é clicada */
  onAlocacaoClick?: (alocacao: AlocacaoHorarioResponseDto) => void
  /** Slot que causou erro de validação, para destaque visual */
  errorSlot?: {
    day: string
    startTime: string
    endTime: string
  } | null
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente de grid de horários para alocação de turmas
 */
export const ScheduleGrid = React.memo(
  ({
    configuracaoHorario,
    alocacoes = [],
    onSlotClick,
    onAlocacaoClick,
    errorSlot,
    className,
  }: ScheduleGridProps) => {
    // Dias da semana
    const daysToShow = useMemo(
      () => ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
      [],
    )

    // Processar slots de aula da configuração usando o utilitário
    const classSlots = useMemo(() => {
      return processClassSlots(configuracaoHorario)
    }, [configuracaoHorario])

    // Agrupar alocações por posição no grid
    const allocationsByPosition = useMemo(() => {
      return groupAllocationsByPosition(alocacoes, classSlots, daysToShow)
    }, [alocacoes, classSlots, daysToShow])

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
              {daysToShow.map((day, dayIndex) => {
                // Buscar alocações para esta posição
                const positionKey = `${dayIndex}-${classSlotIndex}`
                const cellAllocations =
                  allocationsByPosition.get(positionKey) || []

                return (
                  <ScheduleCell
                    key={`${day}-${classSlotIndex}`}
                    day={day}
                    classSlot={classSlot}
                    classSlotIndex={classSlotIndex}
                    dayIndex={dayIndex}
                    alocacoes={cellAllocations}
                    allAlocacoes={alocacoes}
                    onSlotClick={onSlotClick}
                    onAlocacaoClick={onAlocacaoClick}
                    onKeyDown={handleKeyDown}
                    isErrorSlot={
                      !!errorSlot &&
                      errorSlot.day === day &&
                      errorSlot.startTime === classSlot.inicio &&
                      errorSlot.endTime === classSlot.fim
                    }
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  },
)

export default ScheduleGrid
