import { DataTable } from "@/components/data-table/data-table"
import { type DisponibilidadeResponseDto } from "@/api-generated/model"
import { disponibilidadeColumns } from "./disponibilidade-columns"
import { DisponibilidadeActionRowDropdownMenu } from "./disponibilidade-action-row-dropdown-menu"
import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

/**
 * Propriedades da tabela de disponibilidades
 */
interface DisponibilidadesDataTableProps {
  /** Dados para exibir na tabela */
  data: DisponibilidadeResponseDto[]
  /** Callback para editar disponibilidade */
  onEdit?: (disponibilidade: DisponibilidadeResponseDto) => void
  /** Callback para excluir disponibilidade */
  onDelete?: (id: string) => void
  /** Se está carregando */
  isLoading?: boolean
}

/**
 * Componente de tabela para exibição de disponibilidades
 */
export function DisponibilidadesDataTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
}: DisponibilidadesDataTableProps) {
  // Modificar as columns para incluir as callbacks de ações
  const columnsWithActions = useMemo(() => {
    return disponibilidadeColumns.map((column) => {
      if (column.id === "actions") {
        return {
          ...column,
          cell: ({ row }: { row: any }) => {
            const disponibilidade = row.original

            return (
              <div className="flex justify-end">
                <DisponibilidadeActionRowDropdownMenu
                  disponibilidade={disponibilidade}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            )
          },
        }
      }
      return column
    }) as ColumnDef<DisponibilidadeResponseDto>[]
  }, [onEdit, onDelete])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">
          Carregando disponibilidades...
        </div>
      </div>
    )
  }

  return (
    <DataTable
      columns={columnsWithActions}
      data={data}
    />
  )
}
