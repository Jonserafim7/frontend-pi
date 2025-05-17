import type { ColumnDef } from "@tanstack/react-table"
import type { CursoResponseDto } from "@/api-generated/model/curso-response-dto"
import { CourseActionRowDropdownMenu } from "./course-action-row-dropdown-menu"

/**
 * Definição das colunas para a tabela de cursos
 * @returns Colunas configuradas para o DataTable
 */
export const courseColumns: ColumnDef<CursoResponseDto>[] = [
  // Coluna para o nome do curso
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
  },
  // Coluna para o código do curso
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => <span className="font-medium">{row.original.codigo}</span>,
  },
  // Coluna para o coordenador do curso
  {
    id: "coordenador",
    header: "Coordenador",
    cell: ({ row }) => {
      const coordenador = row.original.coordenadorPrincipal
      return coordenador ?
          <span className="font-medium">{coordenador.nome}</span>
        : <span className="text-muted-foreground italic">Sem coordenador</span>
    },
  },
  // Coluna para as ações (editar/excluir)
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const course = row.original
      return <CourseActionRowDropdownMenu course={course} />
    },
  },
]
