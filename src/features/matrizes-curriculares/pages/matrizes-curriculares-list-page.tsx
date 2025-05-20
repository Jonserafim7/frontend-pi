import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpenCheckIcon, Plus } from "lucide-react"
import { MatrizCurricularDataTable } from "../components/data-table/matriz-curricular-data-table"
import { CreateEditMatrizCurricularFormDialog } from "../components/create-edit-matriz-curricular-form-dialog"
import { HeaderIconContainer } from "@/components/icon-container"

/**
 * Página de listagem de matrizes curriculares
 */
export function MatrizesCurricularesListPage() {
  const [
    isCreateEditMatrizCurricularFormDialogOpen,
    setIsCreateEditMatrizCurricularFormDialogOpen,
  ] = useState(false)

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={BookOpenCheckIcon} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Matrizes Curriculares</h1>
            <p className="text-muted-foreground">
              Gerencie as matrizes curriculares dos cursos
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateEditMatrizCurricularFormDialogOpen(true)}
          disabled={isCreateEditMatrizCurricularFormDialogOpen}
        >
          Nova Matriz Curricular
          <Plus />
        </Button>
      </div>

      <MatrizCurricularDataTable />

      {isCreateEditMatrizCurricularFormDialogOpen && (
        <CreateEditMatrizCurricularFormDialog
          open={isCreateEditMatrizCurricularFormDialogOpen}
          onOpenChange={setIsCreateEditMatrizCurricularFormDialogOpen}
        />
      )}
    </div>
  )
}
