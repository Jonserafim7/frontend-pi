// frontend-pi/src/features/periodos-letivos/components/data-table/periodos-letivos-data-table.tsx
import { DataTable } from "@/components/data-table/data-table"
import { usePeriodosLetivosControllerFindAll } from "@/api-generated/client/períodos-letivos/períodos-letivos" // Hook gerado pelo Orval
import { SkeletonTable } from "@/components/skeleton-table"
import { periodosLetivosColumns } from "./periodos-letivos-columns"

/**
 * Componente de tabela de dados específico para Períodos Letivos.
 * Utiliza o componente DataTable genérico e as colunas de Períodos Letivos.
 *
 * @returns {JSX.Element} O elemento JSX da tabela de dados de períodos letivos.
 */
export function PeriodosLetivosDataTable() {
  const {
    data: periodosLetivosData,
    isLoading,
    error,
  } = usePeriodosLetivosControllerFindAll()

  console.log("Periodos Letivos Data:", periodosLetivosData)

  if (isLoading) {
    return (
      <SkeletonTable
        columns={5}
        rows={5}
      />
    )
  }

  if (error) {
    // TODO: Implementar um componente de Erro mais elegante
    return <p>Erro ao carregar períodos letivos: {error.message}</p>
  }

  return (
    <DataTable
      columns={periodosLetivosColumns}
      data={periodosLetivosData ?? []}
    />
  )
}
