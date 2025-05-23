import type { ColumnDef } from "@tanstack/react-table"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import { Badge } from "@/components/ui/badge"
import { DisponibilidadeActionRowDropdownMenu } from "./disponibilidade-action-row-dropdown-menu"
import {
  DIAS_SEMANA_LABELS,
  STATUS_DISPONIBILIDADE_LABELS,
} from "../../schemas/disponibilidade-schemas"

/**
 * Definição das colunas para a tabela de disponibilidades
 */
export const disponibilidadeColumns: ColumnDef<DisponibilidadeResponseDto>[] = [
  {
    accessorKey: "diaDaSemana",
    header: "Dia da Semana",
    cell: ({ row }) => {
      const diaSemana = row.getValue(
        "diaDaSemana",
      ) as keyof typeof DIAS_SEMANA_LABELS
      return <div className="font-medium">{DIAS_SEMANA_LABELS[diaSemana]}</div>
    },
  },
  {
    accessorKey: "horaInicio",
    header: "Horário de Início",
    cell: ({ row }) => {
      const horaInicio = row.getValue("horaInicio") as string
      return <div className="font-mono">{horaInicio}</div>
    },
  },
  {
    accessorKey: "horaFim",
    header: "Horário de Fim",
    cell: ({ row }) => {
      const horaFim = row.getValue("horaFim") as string
      return <div className="font-mono">{horaFim}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
              "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {STATUS_DISPONIBILIDADE_LABELS[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "usuarioProfessor.nome",
    header: "Professor",
    cell: ({ row }) => {
      const professor = row.original.usuarioProfessor
      return <div className="max-w-[200px] truncate">{professor.nome}</div>
    },
  },
  {
    accessorKey: "periodoLetivo",
    header: "Período",
    cell: ({ row }) => {
      const periodo = row.original.periodoLetivo
      return (
        <div className="font-medium">
          {periodo.ano}.{periodo.semestre}
        </div>
      )
    },
  },
  {
    id: "actions",
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
