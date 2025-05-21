import type { ColumnDef } from "@tanstack/react-table"
import type { DisciplinaOfertadaResponseDto } from "@/api-generated/model/disciplina-ofertada-response-dto"
import { Badge } from "@/components/ui/badge"
import { DisciplinaOfertadaActionRowDropdownMenu } from "./disciplina-ofertada-action-row-dropdown-menu"

/**
 * Definição das colunas para a tabela de disciplinas ofertadas
 */
export const disciplinaOfertadaColumns: ColumnDef<DisciplinaOfertadaResponseDto>[] = [
  {
    accessorKey: "disciplina.nome",
    header: "Disciplina",
    cell: ({ row }) => {
      const disciplina = row.original.disciplina
      return (
        <div className="flex flex-col">
          <span className="font-medium">{disciplina?.nome}</span>
          <span className="text-muted-foreground text-xs">
            {disciplina?.codigo}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "periodoLetivo.descricao",
    header: "Período Letivo",
    cell: ({ row }) => {
      const periodo = row.original.periodoLetivo
      return (
        <div className="flex flex-col">
          <span>
            {periodo?.ano}/{periodo?.semestre}º Semestre
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "quantidadeTurmas",
    header: "Turmas",
    cell: ({ row }) => {
      const qtdTurmas = row.original.quantidadeTurmas
      return (
        <Badge
          variant="outline"
          className="w-10 justify-center"
        >
          {qtdTurmas}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const disciplinaOfertada = row.original
      return (
        <div className="flex justify-end">
          <DisciplinaOfertadaActionRowDropdownMenu disciplinaOfertada={disciplinaOfertada} />
        </div>
      )
    },
  },
]
