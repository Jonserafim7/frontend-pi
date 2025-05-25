import { useState } from "react"
import { Plus, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeaderIconContainer } from "@/components/icon-container"
import { TurmaDataTable } from "../components/data-table/turma-data-table"
import { CreateEditTurmaFormDialog } from "../components/create-edit-turma-form-dialog"

/**
 * Página de listagem e gestão de turmas
 */
export function TurmasListPage() {
  const [isCreateEditTurmaFormDialogOpen, setIsCreateEditTurmaFormDialogOpen] =
    useState(false)

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={GraduationCap} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Turmas</h1>
            <p className="text-muted-foreground">
              Gerencie as turmas das disciplinas ofertadas
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateEditTurmaFormDialogOpen(true)}>
          <Plus />
          Nova Turma
        </Button>
      </div>

      {/* Data Table */}
      <TurmaDataTable />

      {/* Dialogs */}
      <CreateEditTurmaFormDialog
        open={isCreateEditTurmaFormDialogOpen}
        onOpenChange={setIsCreateEditTurmaFormDialogOpen}
      />
    </div>
  )
}
