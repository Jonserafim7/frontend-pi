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

interface DiretorPropostasFiltersProps {
  table: Table<PropostaHorarioResponseDto>
}

/**
 * Componente de filtros para a data table de propostas para diretores
 * Inclui filtros por status, curso e coordenador
 */
export function DiretorPropostasFilters({ table }: DiretorPropostasFiltersProps) {
  // Colunas para filtros
  const statusColumn = table.getColumn("status")
  const cursoColumn = table.getColumn("curso.nome")
  const coordenadorColumn = table.getColumn("coordenadorQueSubmeteu.nome")

  // Valores atuais dos filtros
  const currentStatusFilter = statusColumn?.getFilterValue() as
    | PropostaStatus[]
    | undefined
  const currentCursoFilter = cursoColumn?.getFilterValue() as string[] | undefined
  const currentCoordenadorFilter = coordenadorColumn?.getFilterValue() as
    | string[]
    | undefined

  // Estados dos dropdowns
  const [statusOpen, setStatusOpen] = React.useState(false)
  const [cursoOpen, setCursoOpen] = React.useState(false)
  const [coordenadorOpen, setCoordenadorOpen] = React.useState(false)

  // Opções de status
  const statusOptions = Object.entries(PROPOSTA_STATUS_CONFIG).map(
    ([value, config]) => ({
      value,
      label: config.label,
      description: config.description,
    }),
  )

  // Extrair opções únicas de cursos e coordenadores dos dados
  const cursoOptions = React.useMemo(() => {
    const cursos = table.getPreFilteredRowModel().rows.map((row) => {
      const curso = row.original.curso
      return {
        value: curso?.nome || "",
        label: curso?.nome || "Sem curso",
        codigo: curso?.codigo || "",
      }
    })
    // Remover duplicatas baseado no nome
    const uniqueCursos = cursos.filter(
      (curso, index, self) =>
        curso.value && self.findIndex((c) => c.value === curso.value) === index,
    )
    return uniqueCursos.sort((a, b) => a.label.localeCompare(b.label))
  }, [table])

  const coordenadorOptions = React.useMemo(() => {
    const coordenadores = table.getPreFilteredRowModel().rows.map((row) => {
      const coord = row.original.coordenadorQueSubmeteu
      return {
        value: coord?.nome || "",
        label: coord?.nome || "Sem coordenador",
        email: coord?.email || "",
      }
    })
    // Remover duplicatas baseado no nome
    const uniqueCoordenadores = coordenadores.filter(
      (coord, index, self) =>
        coord.value && self.findIndex((c) => c.value === coord.value) === index,
    )
    return uniqueCoordenadores.sort((a, b) => a.label.localeCompare(b.label))
  }, [table])

  // Handlers para filtros
  const handleStatusFilterChange = (statusValue: PropostaStatus) => {
    const currentFilter = currentStatusFilter || []

    if (currentFilter.includes(statusValue)) {
      const newFilter = currentFilter.filter((status) => status !== statusValue)
      statusColumn?.setFilterValue(newFilter.length > 0 ? newFilter : undefined)
    } else {
      statusColumn?.setFilterValue([...currentFilter, statusValue])
    }
  }

  const handleCursoFilterChange = (cursoValue: string) => {
    const currentFilter = currentCursoFilter || []

    if (currentFilter.includes(cursoValue)) {
      const newFilter = currentFilter.filter((curso) => curso !== cursoValue)
      cursoColumn?.setFilterValue(newFilter.length > 0 ? newFilter : undefined)
    } else {
      cursoColumn?.setFilterValue([...currentFilter, cursoValue])
    }
  }

  const handleCoordenadorFilterChange = (coordenadorValue: string) => {
    const currentFilter = currentCoordenadorFilter || []

    if (currentFilter.includes(coordenadorValue)) {
      const newFilter = currentFilter.filter(
        (coord) => coord !== coordenadorValue,
      )
      coordenadorColumn?.setFilterValue(
        newFilter.length > 0 ? newFilter : undefined,
      )
    } else {
      coordenadorColumn?.setFilterValue([...currentFilter, coordenadorValue])
    }
  }

  // Clear functions
  const clearAllFilters = () => {
    statusColumn?.setFilterValue(undefined)
    cursoColumn?.setFilterValue(undefined)
    coordenadorColumn?.setFilterValue(undefined)
  }

  return (
    <div className="space-y-4">
      {/* Filtros principais */}
      <div className="flex flex-wrap items-center gap-4">
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
                      PROPOSTA_STATUS_CONFIG[
                        currentStatusFilter[0] as keyof typeof PROPOSTA_STATUS_CONFIG
                      ]?.label
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
                            handleStatusFilterChange(
                              option.value as PropostaStatus,
                            )
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
        </div>

        {/* Filtro por Curso */}
        <div className="flex flex-col gap-2">
          <Popover
            open={cursoOpen}
            onOpenChange={setCursoOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cursoOpen}
                className={cn(
                  "w-[200px] justify-between",
                  currentCursoFilter?.length && "border-primary",
                )}
              >
                {currentCursoFilter?.length ?
                  <span className="truncate">
                    {currentCursoFilter.length === 1 ?
                      currentCursoFilter[0]
                    : `${currentCursoFilter.length} cursos selecionados`}
                  </span>
                : "Filtrar por curso..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[250px] p-0"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Buscar curso..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>Nenhum curso encontrado.</CommandEmpty>
                  <CommandGroup>
                    {cursoOptions.map((option) => {
                      const isSelected =
                        currentCursoFilter?.includes(option.value) || false

                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleCursoFilterChange(option.value)}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              {option.codigo && (
                                <span className="text-muted-foreground text-xs">
                                  {String(option.codigo)}
                                </span>
                              )}
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
        </div>

        {/* Filtro por Coordenador */}
        <div className="flex flex-col gap-2">
          <Popover
            open={coordenadorOpen}
            onOpenChange={setCoordenadorOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={coordenadorOpen}
                className={cn(
                  "justify-between",
                  currentCoordenadorFilter?.length && "border-primary",
                )}
              >
                {currentCoordenadorFilter?.length ?
                  <span className="truncate">
                    {currentCoordenadorFilter.length === 1 ?
                      currentCoordenadorFilter[0]
                    : `${currentCoordenadorFilter.length} coordenadores selecionados`
                    }
                  </span>
                : "Filtrar por coordenador..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[250px] p-0"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Buscar coordenador..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>Nenhum coordenador encontrado.</CommandEmpty>
                  <CommandGroup>
                    {coordenadorOptions.map((option) => {
                      const isSelected =
                        currentCoordenadorFilter?.includes(option.value) || false

                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() =>
                            handleCoordenadorFilterChange(option.value)
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              {option.email && (
                                <span className="text-muted-foreground text-xs">
                                  {option.email}
                                </span>
                              )}
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
        </div>

        {/* Botão limpar todos os filtros */}
        {(currentStatusFilter?.length ||
          currentCursoFilter?.length ||
          currentCoordenadorFilter?.length) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar todos os filtros
          </Button>
        )}
      </div>

      {/* Badges dos filtros ativos */}
      <div className="flex flex-wrap gap-2">
        {/* Status badges */}
        {currentStatusFilter && currentStatusFilter.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-muted-foreground text-sm">Status:</span>
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
          </div>
        )}

        {/* Curso badges */}
        {currentCursoFilter && currentCursoFilter.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-muted-foreground text-sm">Curso:</span>
            {currentCursoFilter.map((curso) => (
              <Badge
                key={curso}
                variant="secondary"
                className="gap-1 px-2 py-1 text-xs"
              >
                {curso}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleCursoFilterChange(curso)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Coordenador badges */}
        {currentCoordenadorFilter && currentCoordenadorFilter.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-muted-foreground text-sm">Coordenador:</span>
            {currentCoordenadorFilter.map((coordenador) => (
              <Badge
                key={coordenador}
                variant="secondary"
                className="gap-1 px-2 py-1 text-xs"
              >
                {coordenador}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleCoordenadorFilterChange(coordenador)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
