import { DataTable } from "@/components/data-table/data-table"
import { turmaColumns } from "./turma-columns"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import { SkeletonTable } from "@/components/skeleton-table"

/**
 * Componente de tabela de dados para Turmas
 */
export function TurmaDataTable() {
  const { data: turmas, isPending: isLoading } = useTurmasControllerFindAll()

  if (isLoading) {
    return (
      <SkeletonTable
        columns={6}
        rows={5}
      />
    )
  }

  return (
    <DataTable
      columns={turmaColumns}
      data={turmas ?? []}
    />
  )
}
