import type { ColumnDef } from "@tanstack/react-table"
import type { DisciplinaResponseDto } from "@/api-generated/model/disciplina-response-dto"
import { DisciplinaActionRowDropdownMenu } from "./disciplina-action-row-dropdown-menu"

/**
 * Definição das colunas para a tabela de disciplinas
 */
export const disciplinaColumns: ColumnDef<DisciplinaResponseDto>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => {
      const codigo = row.getValue("codigo") as string | undefined
      return <div>{codigo || "-"}</div>
    },
  },
  {
    accessorKey: "cargaHoraria",
    header: "Carga Horária",
    cell: ({ row }) => {
      const cargaHoraria = row.getValue("cargaHoraria") as number
      return <div>{cargaHoraria} horas</div>
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const disciplina = row.original

      return <DisciplinaActionRowDropdownMenu disciplina={disciplina} />
    },
  },
]
