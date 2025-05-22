import { PeriodosLetivosDataTable } from "../components/data-table/periodos-letivos-data-table"
import { HeaderIconContainer } from "@/components/icon-container"
import { BookTextIcon } from "lucide-react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CreateEditPeriodoLetivoFormDialog } from "../components/create-edit-periodo-letivo-form-dialog"

/**
 * Página para listar e gerenciar Períodos Letivos.
 * Utiliza o hook usePeriodosLetivosFindAll para buscar dados e os exibe em uma tabela.
 *
 * @returns {JSX.Element} O elemento JSX da página de listagem de períodos letivos.
 */
export function PeriodosLetivosListPage() {
  const [
    isCreateEditPeriodoLetivoDialogOpen,
    setIsCreateEditPeriodoLetivoDialogOpen,
  ] = useState(false)

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={BookTextIcon} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Períodos Letivos</h1>
            <p className="text-muted-foreground">
              Gerencie os períodos letivos do sistema
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateEditPeriodoLetivoDialogOpen(true)}>
          <Plus />
          Novo Período Letivo
        </Button>
      </div>
      <PeriodosLetivosDataTable />
      <CreateEditPeriodoLetivoFormDialog
        open={isCreateEditPeriodoLetivoDialogOpen}
        onOpenChange={setIsCreateEditPeriodoLetivoDialogOpen}
        mode="create"
        onSuccess={() => setIsCreateEditPeriodoLetivoDialogOpen(false)}
      />
    </div>
  )
}
