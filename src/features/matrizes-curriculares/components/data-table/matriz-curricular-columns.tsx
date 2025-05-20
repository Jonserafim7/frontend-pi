import type { ColumnDef } from "@tanstack/react-table"
import type { MatrizCurricularResponseDto } from "@/api-generated/model"
import { Badge } from "@/components/ui/badge"
import { MatrizCurricularActionsRowDropdownMenu } from "./matriz-curricular-action-row-dropdown-menu"

/**
 * Definição das colunas para a tabela de Matrizes Curriculares
 */
export const matrizCurricularColumns: ColumnDef<MatrizCurricularResponseDto>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => <div className="font-medium">{row.getValue("nome")}</div>,
  },
  {
    accessorKey: "nomeCurso",
    header: "Curso",
    cell: ({ row }) => <div>{row.getValue("nomeCurso")}</div>,
  },
  {
    accessorKey: "disciplinas",
    header: "Disciplinas",
    cell: ({ row }) => {
      const disciplinas = row.original.disciplinas || []
      return (
        <div>
          <Badge variant="outline">{disciplinas.length}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const matrizCurricular = row.original

      return (
        <MatrizCurricularActionsRowDropdownMenu
          matrizCurricularId={matrizCurricular.id}
          matrizCurricularName={matrizCurricular.nome}
        />
      )
    },
  },
]
