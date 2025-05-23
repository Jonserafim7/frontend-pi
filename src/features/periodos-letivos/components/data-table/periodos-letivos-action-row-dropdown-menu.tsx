import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Power, PowerOff } from "lucide-react"
import { type PeriodoLetivoResponseDto } from "@/api-generated/model"
import { useState } from "react"
import { DeletePeriodoLetivoAlertDialog } from "../delete-periodo-letivo-alert-dialog"
import { CreateEditPeriodoLetivoFormDialog } from "../create-edit-periodo-letivo-form-dialog"
import { ChangeStatusPeriodoLetivoDialog } from "../change-status-periodo-letivo-dialog"

interface PeriodosLetivosActionRowDropdownMenuProps {
  periodoLetivo: PeriodoLetivoResponseDto
}

/**
 * @description Menu de ações para a linha da tabela de Períodos Letivos.
 */
export function PeriodosLetivosActionRowDropdownMenu({
  periodoLetivo,
}: PeriodosLetivosActionRowDropdownMenuProps) {
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false)
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false)

  const isActive = periodoLetivo.status === "ATIVO"
  const newStatus = isActive ? "INATIVO" : "ATIVO"

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
          <DropdownMenuItem onClick={() => setIsEditMenuOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsChangeStatusOpen(true)}
            className={
              isActive ?
                "text-orange-600 hover:!text-orange-600"
              : "text-green-600 hover:!text-green-600"
            }
          >
            {isActive ?
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desativar
              </>
            : <>
                <Power className="mr-2 h-4 w-4" />
                Ativar
              </>
            }
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteMenuOpen(true)}
            className="text-destructive hover:!text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateEditPeriodoLetivoFormDialog
        open={isEditMenuOpen}
        onOpenChange={setIsEditMenuOpen}
        mode="edit"
        periodoLetivo={periodoLetivo}
        onSuccess={() => setIsEditMenuOpen(false)}
      />
      <DeletePeriodoLetivoAlertDialog
        isOpen={isDeleteMenuOpen}
        onOpenChange={setIsDeleteMenuOpen}
        periodoLetivo={periodoLetivo}
      />
      <ChangeStatusPeriodoLetivoDialog
        open={isChangeStatusOpen}
        onOpenChange={setIsChangeStatusOpen}
        periodoLetivo={periodoLetivo}
        newStatus={newStatus}
      />
    </>
  )
}
