import { DataTable } from "@/components/data-table/data-table"
import { courseColumns } from "./course-columns"
import { useCursosControllerFindAll } from "@/api-generated/client/cursos/cursos"

/**
 * Componente de tabela para exibição e gerenciamento de cursos
 */
export function CourseDataTable() {
  const { data } = useCursosControllerFindAll()
  return (
    <DataTable
      columns={courseColumns}
      data={data ?? []}
    />
  )
}
