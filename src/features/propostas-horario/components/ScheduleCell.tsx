import React from "react"
import { cn } from "@/lib/utils"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import { AlocacaoCardCompact } from "./AlocacaoCard"
import { ConflictIndicator } from "./ConflictIndicator"
import { useConflicts } from "../hooks/useConflicts"

interface ScheduleCellProps {
  day: string
  classSlot: { inicio: string; fim: string; turno: "manha" | "tarde" | "noite" }
  classSlotIndex: number
  dayIndex: number
  /** Alocações para este slot */
  alocacoes?: AlocacaoHorarioResponseDto[]
  /** Todas as alocações do sistema para detecção de conflitos */
  allAlocacoes?: AlocacaoHorarioResponseDto[]
  onSlotClick?: (slotInfo: {
    day: string
    startTime: string
    endTime: string
    turno: "manha" | "tarde" | "noite"
  }) => void
  /** Callback quando uma alocação é clicada */
  onAlocacaoClick?: (alocacao: AlocacaoHorarioResponseDto) => void
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
  /** Se este slot é o que causou um erro de validação recente */
  isErrorSlot?: boolean
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
    alocacoes = [],
    allAlocacoes = [],
    onSlotClick,
    onAlocacaoClick,
    onKeyDown,
    isErrorSlot,
    className,
  }: ScheduleCellProps) => {
    // Detectar conflitos para as alocações desta célula
    const { getConflictsForAllocation } = useConflicts({
      alocacoes: allAlocacoes,
      enabled: allAlocacoes.length > 0,
    })

    // Encontrar conflitos para cada alocação desta célula
    const cellConflicts = React.useMemo(() => {
      const conflicts = []
      for (const alocacao of alocacoes) {
        const alocacaoConflicts = getConflictsForAllocation(alocacao.id)
        conflicts.push(...alocacaoConflicts)
      }
      // Remover duplicatas
      return conflicts.filter(
        (conflict, index, self) =>
          self.findIndex((c) => c.id === conflict.id) === index,
      )
    }, [alocacoes, getConflictsForAllocation])

    const handleClick = (event: React.MouseEvent) => {
      // Se clicou em uma alocação, não propagar o evento
      if ((event.target as HTMLElement).closest("[data-allocation-card]")) {
        return
      }

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

    const handleAlocacaoClick = (alocacao: AlocacaoHorarioResponseDto) => {
      onAlocacaoClick?.(alocacao)
    }

    const hasAllocations = alocacoes.length > 0
    const hasConflicts = cellConflicts.length > 0
    const hasMultipleAllocations = alocacoes.length > 1

    return (
      <div
        id={`schedule-cell-${day}-${classSlotIndex}`}
        className={cn(
          "relative min-h-[60px] cursor-pointer p-1",
          "border-border border-r border-b last:border-r-0",
          "bg-background transition-colors duration-200",
          !hasAllocations && "hover:bg-muted/50 focus:bg-muted/70",
          "focus:ring-primary/20 focus:ring-2 focus:outline-none",
          "focus:border-primary/50",
          hasConflicts && "bg-destructive/10 border-destructive/30",
          hasMultipleAllocations &&
            !hasConflicts &&
            "border-orange-200 bg-orange-50",
          isErrorSlot &&
            "border-red-500 bg-red-200 ring-2 ring-red-500 dark:bg-red-700/30",
          className,
        )}
        role="gridcell"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Slot de ${classSlot.turno} ${day} das ${classSlot.inicio} às ${classSlot.fim}${
          hasAllocations ? ` - ${alocacoes.length} alocação(ões)` : " - vazio"
        }${hasConflicts ? ` - ${cellConflicts.length} conflito(s)` : ""}`}
      >
        {/* Indicador de conflitos */}
        {hasConflicts && (
          <div className="absolute top-1 right-1 z-10">
            <ConflictIndicator
              conflicts={cellConflicts}
              size="sm"
              iconOnly
            />
          </div>
        )}

        {/* Exibir alocações */}
        {hasAllocations && (
          <div className="h-full space-y-1">
            {alocacoes.map((alocacao, index) => {
              // Encontrar conflitos específicos desta alocação
              const alocacaoConflicts = getConflictsForAllocation(alocacao.id)
              const hasAlocacaoConflicts = alocacaoConflicts.length > 0

              return (
                <div
                  key={alocacao.id}
                  data-allocation-card
                  className={cn(
                    "relative",
                    hasMultipleAllocations && index > 0 && "opacity-75",
                  )}
                >
                  <AlocacaoCardCompact
                    alocacao={alocacao}
                    onClick={handleAlocacaoClick}
                    className={cn(
                      "w-full",
                      hasAlocacaoConflicts &&
                        "border-destructive/50 bg-destructive/5",
                    )}
                  />

                  {/* Indicador de múltiplas alocações no mesmo slot */}
                  {hasMultipleAllocations && index === 0 && !hasConflicts && (
                    <div className="border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 bg-orange-500">
                      <span className="sr-only">Múltiplas alocações</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Slot vazio */}
        {!hasAllocations && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-muted-foreground/30 text-center text-xs">
              Clique para alocar
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default ScheduleCell
