import { UsersDataTable } from "../components/data-table/users-data-table"
import { useState } from "react"
import { CreateEditUserFormDialog } from "../components/create-edit-user-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"

/**
 * Página de listagem de usuários
 */
export function UserListPage() {
  const [isCreateEditUserFormDialogOpen, setIsCreateEditUserFormDialogOpen] =
    useState(false)

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={Users} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">
              Lista de todos os usuários do sistema
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateEditUserFormDialogOpen(true)}
          disabled={isCreateEditUserFormDialogOpen}
        >
          Novo Usuário
          <Plus />
        </Button>
      </div>
      <CreateEditUserFormDialog
        isOpen={isCreateEditUserFormDialogOpen}
        onOpenChange={setIsCreateEditUserFormDialogOpen}
      />
      <UsersDataTable />
    </div>
  )
}
