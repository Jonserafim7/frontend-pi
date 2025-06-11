import { UsersDataTable } from "../components/data-table/users-data-table"
import { useState } from "react"
import { CreateEditUserFormDialog } from "../components/create-edit-user-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users, Filter, X } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { useSearchParams } from "react-router"
import { UsuarioResponseDtoPapel } from "@/api-generated/model/usuario-response-dto-papel"
import { Badge } from "@/components/ui/badge"

/**
 * Página de listagem de usuários
 * @component
 * @example
 * <UserListPage />
 *
 * @description
 * Página principal para gerenciamento de usuários do sistema.
 * Permite visualizar, filtrar, criar e editar usuários conforme permissões do usuário logado.
 * Suporta filtros por papel através de query parameters na URL.
 *
 * @returns {JSX.Element} Página de listagem de usuários
 *
 * @since 1.0.0
 * @see {@link UsersDataTable} - Tabela de usuários
 * @see {@link CreateEditUserFormDialog} - Dialog para criar/editar usuários
 */
export function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateEditUserFormDialogOpen, setIsCreateEditUserFormDialogOpen] =
    useState(false)
  const { user, isAdmin, isDiretor, isCoordenador } = useAuth()

  /**
   * Filtro por papel ativo na URL
   * @type {UsuarioResponseDtoPapel | null}
   */
  const papelFilter = searchParams.get("papel") as UsuarioResponseDtoPapel | null

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

  /**
   * Traduz o papel do usuário para português
   * @param papel - Papel do usuário
   * @returns string traduzida
   */
  const translateRole = (papel: UsuarioResponseDtoPapel): string => {
    const translations = {
      [UsuarioResponseDtoPapel.ADMIN]: "Administradores",
      [UsuarioResponseDtoPapel.DIRETOR]: "Diretores",
      [UsuarioResponseDtoPapel.COORDENADOR]: "Coordenadores",
      [UsuarioResponseDtoPapel.PROFESSOR]: "Professores",
    }
    return translations[papel] || papel
  }

  /**
   * Remove o filtro por papel da URL
   */
  const clearFilter = () => {
    setSearchParams((params) => {
      params.delete("papel")
      return params
    })
  }

  /**
   * Verifica se há filtro ativo
   * @returns boolean
   */
  const hasActiveFilter = Boolean(papelFilter)

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={Users} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {hasActiveFilter ?
                  translateRole(papelFilter!)
                : getLabelByUserRole()}
              </h1>
              {hasActiveFilter && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3 w-3" />
                  Filtrado
                  <button
                    onClick={clearFilter}
                    className="hover:bg-background ml-1 rounded-sm p-0.5"
                    title="Remover filtro"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {hasActiveFilter ?
                `Listagem de ${translateRole(papelFilter!).toLowerCase()} do sistema`
              : `Gerenciamento de ${getLabelByUserRole().toLowerCase()}`}
            </p>
          </div>
        </div>

        {(isDiretor() || isAdmin() || isCoordenador()) && (
          <Button
            onClick={() => setIsCreateEditUserFormDialogOpen(true)}
            disabled={isCreateEditUserFormDialogOpen}
          >
            Cadastrar{" "}
            {hasActiveFilter ?
              translateRole(papelFilter!).toLowerCase().slice(0, -1)
            : getLabelByUserRole().toLowerCase()}
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
