import React, { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

import type {
  HorarioGridProps,
  GridViewOptions,
  GridData,
  TimeSlot,
  GridCell,
  DayColumn,
  AlocacaoHorarioResponseDto,
  DiaSemana,
} from "../../types"

// Import API Param types directly from their source using path aliases
import type { AlocacoesHorariosControllerFindManyParams } from "@/api-generated/model/alocacoes-horarios-controller-find-many-params"
import type { AlocacoesHorariosControllerFindManyDiaDaSemana } from "@/api-generated/model/alocacoes-horarios-controller-find-many-dia-da-semana"

import { GridHeader } from "./GridHeader"
import { HorarioSlot } from "./HorarioSlot"
import {
  DIAS_SEMANA_ORDEM,
  DIAS_SEMANA_LABELS,
  DIAS_SEMANA_ABBREVIATIONS,
} from "../../types"

// Import the API hook and its query key generator using path aliases
import {
  useAlocacoesHorariosControllerFindMany,
  getAlocacoesHorariosControllerFindManyQueryKey,
} from "@/api-generated/client/alocações-de-horário/alocações-de-horário"

/**
 * Main schedule grid component that displays the weekly schedule
 * with drag-and-drop support for allocating classes to time slots.
 */
export const HorarioGrid: React.FC<HorarioGridProps> = ({
  periodoLetivoId,
  cursoId,
  filters,
  onAlocacaoCreate,
  onAlocacaoUpdate,
  onAlocacaoDelete,
}) => {
  // API Hook Integration
  const queryParams: AlocacoesHorariosControllerFindManyParams = {
    idPeriodoLetivo: periodoLetivoId,
    // cursoId is not a direct filter for AlocacoesHorariosControllerFindManyParams.
    // diaDaSemana from filters (GridViewOptions) is also not directly applicable here.
    // If specific day filtering is needed for the API call, it should be passed explicitly to HorarioGrid
    // or derived from a more suitable prop than `filters: Partial<GridViewOptions>`.
  }

  const {
    data, // React Query wraps the response, `data` here is AlocacaoHorarioResponseDto[] | undefined
    isLoading,
    error,
  } = useAlocacoesHorariosControllerFindMany(queryParams, {
    query: {
      queryKey: getAlocacoesHorariosControllerFindManyQueryKey(queryParams),
      enabled: !!periodoLetivoId,
    },
  })

  // `data` from the hook is AlocacaoHorarioResponseDto[] | undefined
  const alocacoes: AlocacaoHorarioResponseDto[] = data || []

  let apiErrorMessage: string | null = null
  if (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      apiErrorMessage = (error as { message: string }).message
    } else if (typeof error === "string") {
      apiErrorMessage = error
    }
    if (!apiErrorMessage) {
      apiErrorMessage = "Erro desconhecido ao buscar alocações"
    }
  }

  // Default view options
  const defaultViewOptions: GridViewOptions = {
    showWeekends: false,
    showEmptySlots: true,
    highlightConflicts: true,
    showTurnoSeparators: true,
    compactView: false,
    selectedTurno: "ALL",
  }

  const [viewOptions, setViewOptions] = useState<GridViewOptions>({
    ...defaultViewOptions,
    ...filters,
  })

  // Handle view options changes
  const handleViewOptionsChange = useCallback(
    (newOptions: Partial<GridViewOptions>) => {
      setViewOptions((prev) => ({ ...prev, ...newOptions }))
    },
    [],
  )

  // Mock data for columns and time slots - This would typically come from a hook or props
  const generateMockTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    let slotIndex = 0
    // Matutino (e.g., 5 slots)
    for (let i = 0; i < 5; i++) {
      const startHour = 7 + i
      const endHour = 8 + i
      slots.push({
        inicio: `${String(startHour).padStart(2, "0")}:30`,
        fim: `${String(endHour).padStart(2, "0")}:20`,
        label: `${i + 1}ª Aula`,
        slotIndex: slotIndex++,
      })
    }
    // Vespertino (e.g., 5 slots)
    for (let i = 0; i < 5; i++) {
      const startHour = 13 + i
      const endHour = 14 + i
      slots.push({
        inicio: `${String(startHour).padStart(2, "0")}:00`,
        fim: `${String(endHour).padStart(2, "0")}:50`,
        label: `${i + 6}ª Aula`,
        slotIndex: slotIndex++,
      })
    }
    // Noturno (e.g., 4 slots)
    for (let i = 0; i < 4; i++) {
      const startHour = 19 + i
      const endHour = 20 + i
      slots.push({
        inicio: `${String(startHour).padStart(2, "0")}:00`,
        fim: `${String(endHour).padStart(2, "0")}:50`,
        label: `${i + 11}ª Aula`,
        slotIndex: slotIndex++,
      })
    }
    return slots
  }

  const mockTimeSlots = generateMockTimeSlots()

  const dayColumns: DayColumn[] = DIAS_SEMANA_ORDEM.filter(
    (dia) => viewOptions.showWeekends || dia !== "SABADO",
  ).map((dia) => ({
    dia,
    label: DIAS_SEMANA_LABELS[dia],
    abbreviation: DIAS_SEMANA_ABBREVIATIONS[dia],
    isWeekend: dia === "SABADO",
  }))

  // Memoize gridData generation to prevent re-renders if alocacoes or viewOptions don't change
  const gridData: GridData = React.useMemo(() => {
    return {
      rows: mockTimeSlots.map((slot) => {
        const turno =
          slot.slotIndex < 5 ? "MATUTINO"
          : slot.slotIndex < 10 ? "VESPERTINO"
          : "NOTURNO" // Basic turno detection
        return {
          timeSlot: slot,
          turno,
          cells: dayColumns.map((col) => {
            // Find allocation for this specific cell
            const cellAlocacao = alocacoes.find(
              (aloc: AlocacaoHorarioResponseDto) =>
                aloc.diaDaSemana === col.dia && aloc.horaInicio === slot.inicio, // Assuming horaInicio matches slot.inicio exactly
              // TODO: May need more robust matching if times can be partial or overlap
            )
            return {
              dia: col.dia,
              timeSlot: slot,
              isEmpty: !cellAlocacao,
              alocacao: cellAlocacao,
              isDropZone: true, // Placeholder
              isHighlighted: false, // Placeholder
              isConflicted: false, // Placeholder - conflict detection will be a separate task
              turno,
            } as GridCell
          }),
        }
      }),
      columns: dayColumns,
      alocacoes: alocacoes, // Store fetched alocacoes
      configuration: {
        duracaoAulaMinutos: 50,
        numeroAulasPorTurno: 5, // Example
        slotsAulaManha: mockTimeSlots.filter((_, i) => i < 5),
        slotsAulaTarde: mockTimeSlots.filter((_, i) => i >= 5 && i < 10),
        slotsAulaNoite: mockTimeSlots.filter((_, i) => i >= 10),
        inicioTurnoManha: "07:30",
        inicioTurnoTarde: "13:00",
        inicioTurnoNoite: "19:00",
        fimTurnoManha: "12:20",
        fimTurnoTarde: "17:50",
        fimTurnoNoite: "22:50",
      },
    }
  }, [mockTimeSlots, dayColumns, alocacoes])

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-16 w-full"
              />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Error state
  if (apiErrorMessage) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar a grade de horários: {apiErrorMessage}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grid Header with controls */}
      <GridHeader
        columns={gridData.columns}
        viewOptions={viewOptions}
        onViewOptionsChange={handleViewOptionsChange}
      />

      {/* Main Grid - Implemented with CSS Grid */}
      <Card className="overflow-hidden p-0 shadow-md">
        <div
          className="grid"
          style={{
            // Responsive grid columns: md breakpoint for tablets (768px)
            // Keep 60px for time, allow day columns to be larger on medium screens
            // The CSS variables (--day-column-min-width, --row-min-height)
            // should be defined in a global CSS file with media queries.
            gridTemplateColumns: `60px repeat(${gridData.columns.length}, minmax(var(--day-column-min-width, 100px), 1fr))`,
            gridAutoRows: "minmax(var(--row-min-height, 60px), auto)",
          }}
        >
          {/* Empty top-left corner */}
          <div className="border-border bg-muted/30 sticky top-0 z-20 border-r border-b p-2 text-center font-semibold">
            <span className="text-xs md:text-sm">Hora</span>{" "}
            {/* Slightly larger on md */}
          </div>

          {/* Day Headers - Show full labels on md screens and up */}
          {gridData.columns.map((col) => (
            <div
              key={col.dia}
              className="border-border bg-muted/30 sticky top-0 z-20 flex flex-col items-center justify-center border-b p-2 text-center font-semibold"
              style={{
                borderRightWidth:
                  col.dia !== gridData.columns[gridData.columns.length - 1].dia ?
                    "1px"
                  : "0px",
              }}
            >
              {/* Show abbreviation on small screens, full label on medium (md) and up */}
              <span className="block text-xs font-medium uppercase md:hidden">
                {col.abbreviation}
              </span>
              <span className="hidden text-xs font-medium uppercase md:block">
                {col.label}
              </span>
            </div>
          ))}

          {/* Grid Content: Time Slots and Cells */}
          {gridData.rows.map((row, rowIndex) => (
            <React.Fragment key={`row-${row.timeSlot.slotIndex}`}>
              {/* Time Slot Label */}
              <div className="border-border bg-muted/30 sticky left-0 z-10 flex h-full items-center justify-center border-r border-b p-1 text-center text-xs md:text-sm">
                <div className="flex flex-col items-center justify-center">
                  <span>{row.timeSlot.inicio}</span>
                  <span className="text-muted-foreground">
                    {row.timeSlot.fim}
                  </span>
                </div>
              </div>

              {/* Cells for this Time Slot */}
              {row.cells.map((cell, cellIndex) => (
                <HorarioSlot
                  key={`${cell.dia}-${cell.timeSlot.slotIndex}`}
                  cell={cell}
                  position={{ row: rowIndex, col: cellIndex }}
                  onInteraction={(interaction) => {
                    console.log("Grid interaction:", interaction)
                  }}
                  isDropTarget={false}
                  isDragOver={false}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default HorarioGrid
