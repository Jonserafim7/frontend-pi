import type { DisciplinaOfertadaResponseDto } from "@/api-generated/model/disciplina-ofertada-response-dto"
import { DataTable } from "@/components/data-table/data-table"
import { disciplinaOfertadaColumns } from "./disciplina-ofertada-columns"
import { SkeletonTable } from "@/components/skeleton-table"

interface DisciplinaOfertadaDataTableProps {
  data: DisciplinaOfertadaResponseDto[]
  isLoading?: boolean
}

/**
 * Componente principal da tabela de disciplinas ofertadas
 * Utiliza os componentes reutilizáveis de DataTable do projeto
 */
export function DisciplinaOfertadaDataTable({
  data,
  isLoading,
}: DisciplinaOfertadaDataTableProps) {
  // Renderiza um placeholder durante o carregamento
  if (isLoading) {
    return (
      <SkeletonTable
        columns={disciplinaOfertadaColumns.length}
        rows={5}
      />
    )
  }

  return (
    <DataTable
      columns={disciplinaOfertadaColumns}
      data={data}
    />
  )
}
