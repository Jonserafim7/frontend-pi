import type { ColumnDef } from "@tanstack/react-table"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import { Badge } from "@/components/ui/badge"
import { DisponibilidadeActionRowDropdownMenu } from "./disponibilidade-action-row-dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import DIAS_SEMANA_LABELS from "@/lib/constants/dias-da-semana.constant"
import STATUS_DISPONIBILIDADE_LABELS from "@/lib/constants/status-disponibilidade.constant"

/**
 * Definição das colunas para a tabela de disponibilidades
 */
export const disponibilidadeColumns: ColumnDef<DisponibilidadeResponseDto>[] = [
  {
    accessorKey: "diaDaSemana",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Dia da Semana"
      />
    ),
    cell: ({ row }) => {
      const diaSemana = row.getValue(
        "diaDaSemana",
      ) as keyof typeof DIAS_SEMANA_LABELS
      return <div className="font-medium">{DIAS_SEMANA_LABELS[diaSemana]}</div>
    },
  },
  {
    accessorKey: "horaInicio",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Horário de Início"
      />
    ),
    cell: ({ row }) => {
      const horaInicio = row.getValue("horaInicio") as string
      return <div className="font-mono">{horaInicio}</div>
    },
  },
  {
    accessorKey: "horaFim",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Horário de Fim"
      />
    ),
    cell: ({ row }) => {
      const horaFim = row.getValue("horaFim") as string
      return <div className="font-mono">{horaFim}</div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue(
        "status",
      ) as keyof typeof STATUS_DISPONIBILIDADE_LABELS
      const isDisponivel = status === "DISPONIVEL"

      return (
        <Badge
          variant={isDisponivel ? "default" : "secondary"}
          className={
            isDisponivel ?
              "bg-teal-800 text-teal-200 hover:bg-teal-800"
            : "bg-rose-800 text-rose-200 hover:bg-rose-800"
          }
        >
          {STATUS_DISPONIBILIDADE_LABELS[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "usuarioProfessor.nome",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Professor"
      />
    ),
    cell: ({ row }) => {
      const professor = row.original.usuarioProfessor
      return <div className="max-w-[200px] truncate">{professor.nome}</div>
    },
  },
  {
    accessorKey: "periodoLetivo",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Período"
      />
    ),
    cell: ({ row }) => {
      const periodo = row.original.periodoLetivo
      return (
        <div className="font-medium">
          Ano: {periodo.ano} - Semestre: {periodo.semestre}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const disponibilidade = row.original

      return (
        <div className="flex justify-end">
          <DisponibilidadeActionRowDropdownMenu
            disponibilidade={disponibilidade}
          />
        </div>
      )
    },
  },
]
