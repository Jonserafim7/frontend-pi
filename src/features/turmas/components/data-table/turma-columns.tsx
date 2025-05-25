import type { ColumnDef } from "@tanstack/react-table"
import type { TurmaResponseDto } from "@/api-generated/model"
import { Badge } from "@/components/ui/badge"
import { TurmaActionRowDropdownMenu } from "./turma-action-row-dropdown-menu"

/**
 * Definição das colunas para a tabela de Turmas
 */
export const turmaColumns: ColumnDef<TurmaResponseDto>[] = [
  {
    accessorKey: "codigoDaTurma",
    header: "Código da Turma",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("codigoDaTurma")}</div>
    ),
  },
  {
    accessorKey: "disciplinaOfertada",
    header: "Disciplina",
    cell: ({ row }) => {
      const disciplinaOfertada = row.original.disciplinaOfertada
      const disciplina = disciplinaOfertada?.disciplina

      if (!disciplina) return <div className="text-muted-foreground">-</div>

      return (
        <div className="flex flex-col">
          <div className="font-medium">{disciplina.nome}</div>
          {disciplina.codigo && (
            <div className="text-muted-foreground text-sm">
              {disciplina.codigo}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "periodoLetivo",
    header: "Período Letivo",
    cell: ({ row }) => {
      const periodoLetivo = row.original.disciplinaOfertada?.periodoLetivo

      if (!periodoLetivo) return <div className="text-muted-foreground">-</div>

      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline">
            {periodoLetivo.ano}/{periodoLetivo.semestre}º
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "professorAlocado",
    header: "Professor",
    cell: ({ row }) => {
      const professor = row.original.professorAlocado

      if (!professor) {
        return (
          <Badge
            variant="secondary"
            className="text-muted-foreground"
          >
            Não atribuído
          </Badge>
        )
      }

      return <div className="font-medium">{professor.nome}</div>
    },
  },
  {
    accessorKey: "dataCriacao",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dataCriacao"))
      return <div>{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const turma = row.original

      return (
        <TurmaActionRowDropdownMenu
          turmaId={turma.id}
          turmaCode={turma.codigoDaTurma}
          disciplinaNome={turma.disciplinaOfertada?.disciplina?.nome}
          professorAlocado={!!turma.professorAlocado}
        />
      )
    },
  },
]
