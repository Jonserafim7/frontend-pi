import { DataTable } from "@/components/data-table/data-table"
import { matrizCurricularColumns } from "./matriz-curricular-columns"
import { useMatrizesCurricularesControllerFindMatrizesDoCoordenador } from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import { SkeletonTable } from "@/components/skeleton-table"

/**
 * Componente de tabela de dados para Matrizes Curriculares
 *
 * Exibe apenas as matrizes curriculares dos cursos que o coordenador logado coordena.
 * Esta funcionalidade é exclusiva para coordenadores.
 */
export function MatrizCurricularDataTable() {
  const { data: matrizesCurriculares, isPending: isLoading } =
    useMatrizesCurricularesControllerFindMatrizesDoCoordenador()

  if (isLoading) {
    return (
      <SkeletonTable
        columns={5}
        rows={5}
      />
    )
  }

  return (
    <DataTable
      columns={matrizCurricularColumns}
      data={matrizesCurriculares ?? []}
    />
  )
}
