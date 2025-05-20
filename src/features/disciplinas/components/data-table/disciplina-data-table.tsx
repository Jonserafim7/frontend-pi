import { DataTable } from "@/components/data-table/data-table"
import { type DisciplinaResponseDto } from "@/api-generated/model/disciplina-response-dto"
import { disciplinaColumns } from "./disciplina-columns"

interface DisciplinaDataTableProps {
  data: DisciplinaResponseDto[]
}

/**
 * Componente de tabela para exibição de disciplinas
 */
export function DisciplinaDataTable({ data }: DisciplinaDataTableProps) {
  return (
    <DataTable
      columns={disciplinaColumns}
      data={data}
    />
  )
}
