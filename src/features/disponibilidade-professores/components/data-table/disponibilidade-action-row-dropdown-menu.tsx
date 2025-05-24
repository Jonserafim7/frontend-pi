import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type DisponibilidadeResponseDto } from "@/api-generated/model"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useState } from "react"
import { DeleteDisponibilidadeAlertDialog } from "../delete-disponibilidade-alert-dialog"
import { EditDisponibilidadeFormDialog } from "../edit-disponibilidade-form-dialog"

interface DisponibilidadeActionRowDropdownMenuProps {
  disponibilidade: DisponibilidadeResponseDto
}

/**
 * Componente de menu dropdown para ações em cada linha da tabela de disponibilidades
 */
export function DisponibilidadeActionRowDropdownMenu({
  disponibilidade,
}: DisponibilidadeActionRowDropdownMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleEditDialog = () => {
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditDialog}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditDisponibilidadeFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        disponibilidade={disponibilidade}
      />
      <DeleteDisponibilidadeAlertDialog
        disponibilidade={disponibilidade}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  )
}
