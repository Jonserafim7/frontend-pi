import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, PenSquare, Trash } from "lucide-react"
import { useState } from "react"
import { DeleteUserAlertDialog } from "../delete-user-alert-dialog"
import { CreateEditUserFormDialog } from "../create-edit-user-form-dialog"
import type { UsuarioResponseDto } from "@/api-generated/model"

interface UserActionRowDropdownMenuProps {
  user: UsuarioResponseDto
}

export function UserActionRowDropdownMenu({
  user,
}: UserActionRowDropdownMenuProps) {
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false)

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
