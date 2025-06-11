import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, PenSquare, Trash, Clock, Eye } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"
import { DeleteUserAlertDialog } from "../delete-user-alert-dialog"
import { CreateEditUserFormDialog } from "../create-edit-user-form-dialog"
import { useAuth } from "@/features/auth/contexts/auth-context"
import type { UsuarioResponseDto } from "@/api-generated/model"

interface UserActionRowDropdownMenuProps {
  user: UsuarioResponseDto
}

export function UserActionRowDropdownMenu({
  user,
}: UserActionRowDropdownMenuProps) {
  const navigate = useNavigate()
  const { isCoordenador, isAdmin, isDiretor } = useAuth()
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false)

  /**
   * Navega para a página de detalhes do professor
   */
  const handleViewDetails = () => {
    navigate(`/usuarios/${user.id}`)
  }

  /**
   * Navega para as disponibilidades do professor
   */
  const handleViewDisponibilidades = () => {
    navigate(`/usuarios/${user.id}/disponibilidades`)
  }

  // Verifica se o usuário pode ver disponibilidades (coordenador, admin ou diretor vendo professor)
  const canViewDisponibilidades =
    user.papel === "PROFESSOR" && (isCoordenador() || isAdmin() || isDiretor())

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Abrir menu de ações</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>

          {/* Opção para ver detalhes */}
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </DropdownMenuItem>

          {/* Opção para ver disponibilidades (apenas para professores) */}
          {canViewDisponibilidades && (
            <DropdownMenuItem onClick={handleViewDisponibilidades}>
              <Clock className="mr-2 h-4 w-4" />
              Ver Disponibilidades
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsEditMenuOpen(true)}>
            <PenSquare className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteMenuOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteUserAlertDialog
        user={user}
        isOpen={isDeleteMenuOpen}
        onOpenChange={setIsDeleteMenuOpen}
      />
      <CreateEditUserFormDialog
        user={user}
        isOpen={isEditMenuOpen}
        onOpenChange={setIsEditMenuOpen}
      />
    </>
  )
}
