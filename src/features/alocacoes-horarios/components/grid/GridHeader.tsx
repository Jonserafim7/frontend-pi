import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Settings, Filter } from "lucide-react"

interface SimpleColumn {
  dia: string
  label: string
  abbreviation: string
  isWeekend?: boolean
}

interface SimpleViewOptions {
  showWeekends: boolean
  showEmptySlots: boolean
  highlightConflicts: boolean
  showTurnoSeparators: boolean
  compactView: boolean
  selectedTurno?: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "ALL"
}

interface SimpleGridHeaderProps {
  columns: SimpleColumn[]
  viewOptions: SimpleViewOptions
  onViewOptionsChange: (options: Partial<SimpleViewOptions>) => void
}

/**
 * Simplified grid header component for initial compilation
 */
export const GridHeader: React.FC<SimpleGridHeaderProps> = ({
  columns,
  viewOptions,
  onViewOptionsChange,
}) => {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
      {/* Main controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" />
            <h2 className="text-lg font-semibold">Grade de Horários</h2>
          </div>

          {/* Day count badge */}
          <Badge
            variant="secondary"
            className="gap-1"
          >
            <span>{columns.length}</span>
            <span className="text-xs">dias</span>
          </Badge>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Status info */}
      <div className="text-muted-foreground text-sm">
        Turno selecionado: {viewOptions.selectedTurno || "ALL"} | Configurações:{" "}
        {
          Object.keys(viewOptions).filter(
            (key) => viewOptions[key as keyof SimpleViewOptions],
          ).length
        }{" "}
        ativas
      </div>
    </div>
  )
}

export default GridHeader
