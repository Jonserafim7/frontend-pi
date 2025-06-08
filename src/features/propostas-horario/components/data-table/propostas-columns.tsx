import type { ColumnDef } from "@tanstack/react-table"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { Badge } from "@/components/ui/badge"
import { formatDateToDisplay } from "@/lib/utils/format-date"
import { PropostaStatusBadge } from "../proposta-status-badge"
import { PropostasActionDropdown } from "./propostas-action-dropdown"

/**
 * Colunas da data table para coordenadores visualizarem suas propostas
 * Inclui: curso, período letivo, status, datas e ações
 */
export const propostasCoordinatorColumns: ColumnDef<PropostaHorarioResponseDto>[] =
  [
    {
      accessorKey: "curso.nome",
      header: "Curso",
      cell: ({ row }) => {
        const curso = row.original.curso
        return (
          <div className="flex flex-col">
            <span className="font-medium">{curso?.nome}</span>
            {curso?.codigo && (
              <span className="text-muted-foreground text-xs">
                {typeof curso.codigo === "string" ? curso.codigo : "Sem código"}
              </span>
            )}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "periodoLetivo",
      header: "Período Letivo",
      cell: ({ row }) => {
        const periodo = row.original.periodoLetivo
        if (!periodo) return <div className="text-muted-foreground">-</div>

        return (
          <div className="flex flex-col">
            <Badge
              variant="outline"
              className="w-fit"
            >
              {periodo.ano}/{periodo.semestre}º
            </Badge>
            <div className="text-muted-foreground mt-1 text-xs">
              {formatDateToDisplay(periodo.dataInicio)} -{" "}
              {formatDateToDisplay(periodo.dataFim)}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.original.periodoLetivo
        const b = rowB.original.periodoLetivo

        if (!a && !b) return 0
        if (!a) return 1
        if (!b) return -1

        // Primeiro compara por ano, depois por semestre
        if (a.ano !== b.ano) {
          return a.ano - b.ano
        }
        return a.semestre - b.semestre
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <PropostaStatusBadge
            status={status}
            showDescription={true}
          />
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: (rowA, rowB, columnId) => {
        const statusOrder = {
          DRAFT: 0,
          PENDENTE_APROVACAO: 1,
          APROVADA: 2,
          REJEITADA: 3,
        }
        const a = statusOrder[rowA.original.status] ?? 999
        const b = statusOrder[rowB.original.status] ?? 999
        return a - b
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "quantidadeAlocacoes",
      header: "Alocações",
      cell: ({ row }) => {
        const quantidade = row.original.quantidadeAlocacoes
        return (
          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className="w-12 justify-center font-mono"
            >
              {quantidade}
            </Badge>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: "basic",
    },
    {
      accessorKey: "dataSubmissao",
      header: "Data Submissão",
      cell: ({ row }) => {
        const dataSubmissao = row.original.dataSubmissao
        if (!dataSubmissao) {
          return (
            <div className="text-muted-foreground text-sm italic">
              Não submetida
            </div>
          )
        }

        return (
          <div className="flex flex-col">
            <div className="text-sm">{formatDateToDisplay(dataSubmissao)}</div>
            <div className="text-muted-foreground text-xs">
              {new Date(dataSubmissao).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: "datetime",
    },
    {
      accessorKey: "dataAprovacaoRejeicao",
      header: "Data Resposta",
      cell: ({ row }) => {
        const dataResposta = row.original.dataAprovacaoRejeicao
        const status = row.original.status

        if (!dataResposta) {
          return (
            <div className="text-muted-foreground text-sm italic">
              Sem resposta
            </div>
          )
        }

        const isApproved = status === "APROVADA"

        return (
          <div className="flex flex-col">
            <div className="text-sm">{formatDateToDisplay(dataResposta)}</div>
            <div
              className={`text-xs ${isApproved ? "text-green-600" : "text-red-600"}`}
            >
              {isApproved ? "Aprovada" : "Rejeitada"}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: "datetime",
    },
    {
      accessorKey: "dataCriacao",
      header: "Criada em",
      cell: ({ row }) => {
        const dataCriacao = row.original.dataCriacao
        return (
          <div className="flex flex-col">
            <div className="text-sm">{formatDateToDisplay(dataCriacao)}</div>
            <div className="text-muted-foreground text-xs">
              {new Date(dataCriacao).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      sortingFn: "datetime",
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const proposta = row.original

        return (
          <div className="flex justify-end">
            <PropostasActionDropdown
              proposta={proposta}
              userRole="coordinator"
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]

/**
 * Colunas da data table para diretores visualizarem propostas de todos os coordenadores
 * Inclui: coordenador, curso, período letivo, status, data submissão e ações
 */
export const propostasDirectorColumns: ColumnDef<PropostaHorarioResponseDto>[] = [
  {
    accessorKey: "coordenadorQueSubmeteu.nome",
    header: "Coordenador",
    cell: ({ row }) => {
      const coordenador = row.original.coordenadorQueSubmeteu
      return (
        <div className="flex flex-col">
          <span className="font-medium">{coordenador?.nome}</span>
          {coordenador?.email && (
            <span className="text-muted-foreground text-xs">
              {coordenador.email}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "curso.nome",
    header: "Curso",
    cell: ({ row }) => {
      const curso = row.original.curso
      return (
        <div className="flex flex-col">
          <span className="font-medium">{curso?.nome}</span>
          {curso?.codigo && (
            <span className="text-muted-foreground text-xs">
              {typeof curso.codigo === "string" ? curso.codigo : "Sem código"}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "periodoLetivo",
    header: "Período Letivo",
    cell: ({ row }) => {
      const periodo = row.original.periodoLetivo
      if (!periodo) return <div className="text-muted-foreground">-</div>

      return (
        <div className="flex flex-col">
          <Badge
            variant="outline"
            className="w-fit"
          >
            {periodo.ano}/{periodo.semestre}º
          </Badge>
          <div className="text-muted-foreground mt-1 text-xs">
            {formatDateToDisplay(periodo.dataInicio)} -{" "}
            {formatDateToDisplay(periodo.dataFim)}
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original.periodoLetivo
      const b = rowB.original.periodoLetivo

      if (!a && !b) return 0
      if (!a) return 1
      if (!b) return -1

      // Primeiro compara por ano, depois por semestre
      if (a.ano !== b.ano) {
        return a.ano - b.ano
      }
      return a.semestre - b.semestre
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <PropostaStatusBadge
          status={status}
          showDescription={true}
        />
      )
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: (rowA, rowB, columnId) => {
      const statusOrder = {
        DRAFT: 0,
        PENDENTE_APROVACAO: 1,
        APROVADA: 2,
        REJEITADA: 3,
      }
      const a = statusOrder[rowA.original.status] ?? 999
      const b = statusOrder[rowB.original.status] ?? 999
      return a - b
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "dataSubmissao",
    header: "Data Submissão",
    cell: ({ row }) => {
      const dataSubmissao = row.original.dataSubmissao
      if (!dataSubmissao) {
        return (
          <div className="text-muted-foreground text-sm italic">
            Não submetida
          </div>
        )
      }

      return (
        <div className="flex flex-col">
          <div className="text-sm">{formatDateToDisplay(dataSubmissao)}</div>
          <div className="text-muted-foreground text-xs">
            {new Date(dataSubmissao).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: "datetime",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const proposta = row.original

      return (
        <div className="flex justify-end">
          {/* TODO: Implementar PropostasActionDropdown para diretores na task 2.5 */}
          <div className="text-muted-foreground text-sm">Ações em breve</div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
