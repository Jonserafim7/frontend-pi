import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Settings2,
  ArrowUpDown,
  Plus,
} from "lucide-react"
import {
  DIAS_SEMANA_LABELS,
  STATUS_DISPONIBILIDADE_LABELS,
} from "../../schemas/disponibilidade-schemas"
import type {
  DiaSemana,
  StatusDisponibilidade,
} from "../../schemas/disponibilidade-schemas"

/**
 * Interface representando uma disponibilidade na tabela
 */
export interface DisponibilidadeTableData {
  id: string
  diaDaSemana: DiaSemana
  horaInicio: string
  horaFim: string
  status: StatusDisponibilidade
  professor?: {
    id: string
    nome: string
  }
  periodoLetivo?: {
    id: string
    nome: string
  }
  dataCriacao: Date
  dataAtualizacao: Date
}

/**
 * Propriedades da tabela de disponibilidades
 */
interface DisponibilidadesDataTableProps {
  /** Dados para exibir na tabela */
  data: DisponibilidadeTableData[]
  /** Callback para editar disponibilidade */
  onEdit?: (disponibilidade: DisponibilidadeTableData) => void
  /** Callback para excluir disponibilidade */
  onDelete?: (id: string) => void
  /** Callback para criar nova disponibilidade */
  onCreate?: () => void
  /** Se está carregando */
  isLoading?: boolean
  /** Se deve mostrar coluna do professor */
  showProfessorColumn?: boolean
  /** Se deve mostrar coluna do período */
  showPeriodoColumn?: boolean
  /** Título da tabela */
  title?: string
}

/**
 * Componente de tabela de dados para disponibilidades
 */
export function DisponibilidadesDataTable({
  data,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
  showProfessorColumn = false,
  showPeriodoColumn = false,
  title = "Disponibilidades",
}: DisponibilidadesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Definir colunas da tabela
  const columns: ColumnDef<DisponibilidadeTableData>[] = [
    {
      accessorKey: "diaDaSemana",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Dia da Semana
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {DIAS_SEMANA_LABELS[row.getValue("diaDaSemana") as DiaSemana]}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const diaA = rowA.getValue("diaDaSemana") as DiaSemana
        const diaB = rowB.getValue("diaDaSemana") as DiaSemana
        const diasOrdem = [
          "SEGUNDA",
          "TERCA",
          "QUARTA",
          "QUINTA",
          "SEXTA",
          "SABADO",
        ] as const
        const orderA = diasOrdem.indexOf(diaA)
        const orderB = diasOrdem.indexOf(diaB)
        return orderA - orderB
      },
    },
    {
      accessorKey: "horaInicio",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Início
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("horaInicio")}</div>
      ),
    },
    {
      accessorKey: "horaFim",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Fim
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("horaFim")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as StatusDisponibilidade
        return (
          <Badge
            variant={status === "DISPONIVEL" ? "default" : "secondary"}
            className={
              status === "DISPONIVEL" ?
                "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {STATUS_DISPONIBILIDADE_LABELS[status]}
          </Badge>
        )
      },
    },
  ]

  // Adicionar coluna do professor se solicitado
  if (showProfessorColumn) {
    columns.splice(4, 0, {
      accessorKey: "professor",
      header: "Professor",
      cell: ({ row }) => {
        const professor = row.getValue("professor") as
          | { nome: string }
          | undefined
        return <div className="text-sm">{professor?.nome || "-"}</div>
      },
    })
  }

  // Adicionar coluna do período se solicitado
  if (showPeriodoColumn) {
    columns.splice(showProfessorColumn ? 5 : 4, 0, {
      accessorKey: "periodoLetivo",
      header: "Período",
      cell: ({ row }) => {
        const periodo = row.getValue("periodoLetivo") as
          | { nome: string }
          | undefined
        return <div className="text-sm">{periodo?.nome || "-"}</div>
      },
    })
  }

  // Adicionar coluna de ações se há callbacks
  if (onEdit || onDelete) {
    columns.push({
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const disponibilidade = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(disponibilidade)}
                  disabled={isLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(disponibilidade.id)}
                  disabled={isLoading}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    })
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Disponibilidade
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Filtrar por dia..."
          value={
            (table.getColumn("diaDaSemana")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("diaDaSemana")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="DISPONIVEL">Disponível</SelectItem>
            <SelectItem value="INDISPONIVEL">Indisponível</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ?
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ?
                    "Carregando..."
                  : "Nenhuma disponibilidade encontrada."}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} de{" "}
          {table.getCoreRowModel().rows.length} linha(s) total.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
