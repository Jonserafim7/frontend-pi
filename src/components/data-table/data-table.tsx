import React from "react"
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Table as ReactTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "../ui/input"
import { DataTablePagination } from "./data-table-pagination"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  header?: (table: ReactTable<TData>) => React.ReactNode
  filters?: (table: ReactTable<TData>) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  header,
  filters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-80 max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors" />
          <Input
            placeholder="Pesquisar em todos os campos..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className={cn(
              "pl-10 transition-all duration-300",
              "bg-background/80 border-border/50",
              "focus-visible:bg-background focus-visible:border-border",
              "focus-visible:ring-ring/20 focus-visible:ring-4",
              "placeholder:text-muted-foreground/60",
            )}
          />
        </div>
        {header && header(table)}
      </div>

      {/* Filters Section */}
      {filters && (
        <div className="border-border/50 bg-background/50 flex items-center gap-4 rounded-lg border p-4">
          {filters(table)}
        </div>
      )}

      {/* Modern Glass-morphism Table Container */}
      <div
        className={cn(
          "border-border/50 overflow-hidden rounded-xl border",
          "bg-background/80",
          "shadow-lg shadow-black/5",
          "ring-1 ring-white/10",
          "transition-all duration-300",
        )}
      >
        <div className="relative overflow-x-auto">
          {/* Decorative gradient overlay */}
          <div className="via-border absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

          <Table className="[&_thead]:bg-muted/30 [&_thead]:">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-border/30 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort()
                    const sortDirection = header.column.getIsSorted()

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-14 px-6 text-sm font-semibold",
                          "text-foreground/90 tracking-wide",
                          "border-border/30 border-r last:border-r-0",
                          isSortable &&
                            "hover:text-foreground cursor-pointer transition-colors select-none",
                        )}
                        onClick={
                          isSortable ?
                            header.column.getToggleSortingHandler()
                          : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder ? null : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                          {isSortable && (
                            <div className="ml-auto">
                              {sortDirection === "asc" && (
                                <ArrowUp className="text-primary h-4 w-4" />
                              )}
                              {sortDirection === "desc" && (
                                <ArrowDown className="text-primary h-4 w-4" />
                              )}
                              {!sortDirection && (
                                <ArrowUpDown className="text-muted-foreground/50 h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ?
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "group border-none transition-all duration-200",
                      "hover:bg-muted/40 hover:backdrop-blur-sm",
                      row.getIsSelected() && "bg-primary/5 hover:bg-primary/10",
                      i % 2 === 0 ? "bg-background/50" : "bg-muted/20",
                      "[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg",
                    )}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-6 py-4 text-sm",
                          "border-border/20 border-r last:border-r-0",
                          "transition-colors duration-200",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="text-muted-foreground/80 flex flex-col items-center justify-center gap-3">
                      <div className="bg-muted/50 rounded-full p-3">
                        <Search className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium">
                          Nenhum resultado encontrado
                        </p>
                        <p className="text-muted-foreground/60 text-sm">
                          Tente ajustar sua pesquisa ou filtros
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>

          {/* Bottom decorative gradient */}
          <div className="via-border/50 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-center">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
