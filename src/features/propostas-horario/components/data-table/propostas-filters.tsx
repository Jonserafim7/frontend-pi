import React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { type Table } from "@tanstack/react-table"
import { type PropostaHorarioResponseDto } from "@/api-generated/model"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  PROPOSTA_STATUS_CONFIG,
  type PropostaStatus,
} from "../../types/proposta-types"

interface PropostasFiltersProps {
  table: Table<PropostaHorarioResponseDto>
}

/**
 * Componente de filtros para a data table de propostas
 * Utiliza TanStack Table column filtering com combobox para status
 */
export function PropostasFilters({ table }: PropostasFiltersProps) {
  const statusColumn = table.getColumn("status")
  const currentStatusFilter = statusColumn?.getFilterValue() as
    | PropostaStatus[]
    | undefined

  // Opções de status disponíveis para filtro
  const statusOptions = Object.entries(PROPOSTA_STATUS_CONFIG).map(
    ([value, config]) => ({
      value,
      label: config.label,
      description: config.description,
    }),
  )

  const [statusOpen, setStatusOpen] = React.useState(false)

  const handleStatusFilterChange = (statusValue: PropostaStatus) => {
    const currentFilter = currentStatusFilter || []

    if (currentFilter.includes(statusValue)) {
      // Remove status do filtro
      const newFilter = currentFilter.filter((status) => status !== statusValue)
      statusColumn?.setFilterValue(newFilter.length > 0 ? newFilter : undefined)
    } else {
      // Adiciona status ao filtro
      statusColumn?.setFilterValue([...currentFilter, statusValue])
    }
  }

  const clearStatusFilter = () => {
    statusColumn?.setFilterValue(undefined)
  }

  const selectedStatusLabels =
    currentStatusFilter?.map(
      (status) =>
        PROPOSTA_STATUS_CONFIG[status as keyof typeof PROPOSTA_STATUS_CONFIG]
          ?.label,
    ) || []

  return (
    <div className="flex items-center gap-4">
      {/* Filtro por Status */}
      <div className="flex flex-col gap-2">
        <Popover
          open={statusOpen}
          onOpenChange={setStatusOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={statusOpen}
              className={cn(
                "w-[200px] justify-between",
                currentStatusFilter?.length && "border-primary",
              )}
            >
              {currentStatusFilter?.length ?
                <span className="truncate">
                  {currentStatusFilter.length === 1 ?
                    selectedStatusLabels[0]
                  : `${currentStatusFilter.length} status selecionados`}
                </span>
              : "Filtrar por status..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-0"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Buscar status..."
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                <CommandGroup>
                  {statusOptions.map((option) => {
                    const isSelected =
                      currentStatusFilter?.includes(
                        option.value as PropostaStatus,
                      ) || false

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() =>
                          handleStatusFilterChange(option.value as PropostaStatus)
                        }
                        className="cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {option.description}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Badges dos status selecionados */}
        {currentStatusFilter && currentStatusFilter.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentStatusFilter.map((status) => (
              <Badge
                key={status}
                variant="secondary"
                className="gap-1 px-2 py-1 text-xs"
              >
                {
                  PROPOSTA_STATUS_CONFIG[
                    status as keyof typeof PROPOSTA_STATUS_CONFIG
                  ]?.label
                }
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() =>
                    handleStatusFilterChange(status as PropostaStatus)
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
              onClick={clearStatusFilter}
            >
              Limpar tudo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
