import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type DisciplinaResponseDto } from "@/api-generated/model/disciplina-response-dto"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { CreateEditDisciplinaFormDialog } from "../create-edit-disciplina-form-dialog"
import { DeleteDisciplinaAlertDialog } from "../delete-disciplina-alert-dialog"
import { useState } from "react"

interface DisciplinaActionRowDropdownMenuProps {
  disciplina: DisciplinaResponseDto
}

/**
 * Componente de menu dropdown para ações em cada linha da tabela de disciplinas
 */
export function DisciplinaActionRowDropdownMenu({
  disciplina,
}: DisciplinaActionRowDropdownMenuProps) {
  const [isEditDisciplinaDialogOpen, setIsEditDisciplinaDialogOpen] =
    useState(false)
  const [isDeleteDisciplinaDialogOpen, setIsDeleteDisciplinaDialogOpen] =
    useState(false)

  return (
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
        <DropdownMenuItem onClick={() => setIsEditDisciplinaDialogOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setIsDeleteDisciplinaDialogOpen(true)}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <DeleteDisciplinaAlertDialog
        disciplina={disciplina}
        isOpen={isDeleteDisciplinaDialogOpen}
        onOpenChange={setIsDeleteDisciplinaDialogOpen}
      />
      <CreateEditDisciplinaFormDialog
        disciplina={disciplina}
        isOpen={isEditDisciplinaDialogOpen}
        onOpenChange={setIsEditDisciplinaDialogOpen}
      />
    </DropdownMenu>
  )
}
