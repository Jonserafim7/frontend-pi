import { Button } from "@/components/ui/button"
import { HeaderIconContainer } from "@/components/icon-container"
import { BookTextIcon } from "lucide-react"
import { Plus } from "lucide-react"
import { DisciplinaDataTable } from "../components/data-table/disciplina-data-table"
import { useDisciplinasControllerFindAll } from "@/api-generated/client/disciplinas/disciplinas"
import { CreateEditDisciplinaFormDialog } from "../components/create-edit-disciplina-form-dialog"
import { SkeletonTable } from "@/components/skeleton-table"
import { disciplinaColumns } from "../components/data-table/disciplina-columns"
import { useState } from "react"

/**
 * Página principal de listagem de disciplinas
 */
export function DisciplinasListPage() {
  const [isCreateEditDisciplinaDialogOpen, setIsCreateEditDisciplinaDialogOpen] =
    useState(false)

  const { data: disciplinas, isLoading } = useDisciplinasControllerFindAll()

  return (
    <>
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderIconContainer Icon={BookTextIcon} />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Disciplinas</h1>
              <p className="text-muted-foreground">
                Gerencie as disciplinas do sistema
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateEditDisciplinaDialogOpen(true)}>
            <Plus />
            Nova Disciplina
          </Button>
        </div>

        {isLoading ?
          <SkeletonTable
            columns={disciplinaColumns.length}
            rows={4}
          />
        : <DisciplinaDataTable data={disciplinas || []} />}
      </div>
      <CreateEditDisciplinaFormDialog
        isOpen={isCreateEditDisciplinaDialogOpen}
        onOpenChange={setIsCreateEditDisciplinaDialogOpen}
      />
    </>
  )
}
