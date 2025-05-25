import { type ColumnDef } from "@tanstack/react-table"
import { type PeriodoLetivoResponseDto } from "@/api-generated/model"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { PeriodosLetivosActionRowDropdownMenu } from "./periodos-letivos-action-row-dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDateToDisplay } from "@/lib/utils/format-date"
import { cn } from "@/lib/utils"

/**
 * @typedef PeriodoLetivoColumns
 * @description Define as colunas para a tabela de dados de Períodos Letivos.
 */
export const periodosLetivosColumns: ColumnDef<PeriodoLetivoResponseDto>[] = [
  {
    accessorKey: "ano",
    header: "Ano",
    cell: ({ row }) => <div>{row.getValue("ano")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "semestre",
    header: "Semestre",
    cell: ({ row }) => <div>{row.getValue("semestre")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "dataInicio",
    header: "Data de Início",
    cell: ({ row }) => {
      const dataInicio = row.getValue("dataInicio") as string | Date | null
      return <div>{dataInicio ? formatDateToDisplay(dataInicio) : "-"}</div>
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "dataFim",
    header: "Data de Fim",
    cell: ({ row }) => {
      const dataFim = row.getValue("dataFim") as string | Date | null
      return <div>{dataFim ? formatDateToDisplay(dataFim) : "-"}</div>
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "ATIVO" ? "default" : "destructive"}
          className={cn(
            "text-xs",
            status === "ATIVO" ? "bg-teal-600" : "bg-rose-600",
          )}
        >
          {status === "ATIVO" ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      // Converte o valor do filtro para o enum correspondente
      const filterValue =
        value === "ativo" ? "ATIVO"
        : value === "inativo" ? "INATIVO"
        : null
      if (filterValue === null) return true // Se o filtro não for válido, não filtra
      return row.getValue(id) === filterValue
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const periodoLetivo = row.original
      return (
        <PeriodosLetivosActionRowDropdownMenu periodoLetivo={periodoLetivo} />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
