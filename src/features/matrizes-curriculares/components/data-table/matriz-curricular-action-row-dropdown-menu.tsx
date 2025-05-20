import { useState } from "react"
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateEditMatrizCurricularFormDialog } from "../create-edit-matriz-curricular-form-dialog"
import { DeleteMatrizCurricularAlertDialog } from "../delete-matriz-curricular-alert-dialog"

/**
 * Propriedades para o menu de ações da matriz curricular
 */
interface MatrizCurricularActionsRowDropdownMenuProps {
  matrizCurricularId: string
  matrizCurricularName: string
}

/**
 * Menu de ações para cada linha na tabela de matrizes curriculares
 */
export function MatrizCurricularActionsRowDropdownMenu({
  matrizCurricularId,
  matrizCurricularName,
}: MatrizCurricularActionsRowDropdownMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              to={`/coordenador/matrizes-curriculares/${matrizCurricularId}`}
              className="flex cursor-pointer items-center gap-2"
            >
              <Eye className="mr-2" />
              Detalhes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Pencil className="mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Trash className="text-destructive mr-2 h-4 w-4" />
            <span className="text-destructive text-sm">Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditDialogOpen && (
        <CreateEditMatrizCurricularFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          matrizCurricularId={matrizCurricularId}
        />
      )}

      <DeleteMatrizCurricularAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        matrizCurricularId={matrizCurricularId}
        matrizCurricularName={matrizCurricularName}
      />
    </>
  )
}
