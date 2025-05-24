import { UsersDataTable } from "../components/data-table/users-data-table"
import { useState } from "react"
import { CreateEditUserFormDialog } from "../components/create-edit-user-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { useAuth } from "@/features/auth/contexts/auth-context"

/**
 * Página de listagem de usuários
 */
export function UserListPage() {
  const [isCreateEditUserFormDialogOpen, setIsCreateEditUserFormDialogOpen] =
    useState(false)
  const { user, isAdmin, isDiretor, isCoordenador } = useAuth()

  /**
   * Retorna o rótulo do título e da descrição de acordo com o papel do usuário
   * @returns string
   */
  const getLabelByUserRole = () => {
    if (!user) {
      return "Usuários"
    }

    if (user?.papel === "ADMIN") {
      return "Usuários"
    } else if (user?.papel === "DIRETOR") {
      return "Coordenadores e professores"
    } else if (user?.papel === "COORDENADOR") {
      return "Professores"
    } else if (user?.papel === "PROFESSOR") {
      return "Meus dados"
    }

    return "Usuários"
  }

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={Users} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{getLabelByUserRole()}</h1>
            <p className="text-muted-foreground">
              Gerencieamento de {getLabelByUserRole().toLowerCase()}
            </p>
          </div>
        </div>

        {(isDiretor() || isAdmin() || isCoordenador()) && (
          <Button
            onClick={() => setIsCreateEditUserFormDialogOpen(true)}
            disabled={isCreateEditUserFormDialogOpen}
          >
            Cadastrar {getLabelByUserRole().toLowerCase()}
            <Plus />
          </Button>
        )}
      </div>
      <CreateEditUserFormDialog
        isOpen={isCreateEditUserFormDialogOpen}
        onOpenChange={setIsCreateEditUserFormDialogOpen}
      />
      <UsersDataTable />
    </div>
  )
}
