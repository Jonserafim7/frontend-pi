import { MoreHorizontal, Pencil, Trash2, Book } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DisciplinaOfertadaResponseDto } from "@/api-generated/model/disciplina-ofertada-response-dto"
import { useToast } from "@/hooks/use-toast"
import { DeleteDisciplinaOfertadaAlertDialog } from "../delete-disciplina-ofertada-alert-dialog"
import { CreateEditDisciplinaOfertadaFormDialog } from "../create-edit-disciplina-ofertada-form-dialog"

interface DisciplinaOfertadaActionRowDropdownMenuProps {
  disciplinaOfertada: DisciplinaOfertadaResponseDto
  onViewTurmas?: () => void
}

/**
 * Componente de menu dropdown para ações em cada linha da tabela de disciplinas ofertadas
 * 
 * @param disciplinaOfertada - A disciplina ofertada a ser manipulada
 * @param onViewTurmas - Função opcional para visualizar turmas da disciplina
 */
export function DisciplinaOfertadaActionRowDropdownMenu({
  disciplinaOfertada,
  onViewTurmas,
}: DisciplinaOfertadaActionRowDropdownMenuProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Funções para manipular ações
  const handleEdit = () => {
    setIsEditDialogOpen(true)
    setIsOpen(false)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
    setIsOpen(false)
  }

  const handleViewTurmas = () => {
    // Se houver uma função personalizada para visualizar turmas, usá-la
    if (onViewTurmas) {
      onViewTurmas()
    } else {
      // Caso contrário, exibir mensagem informativa
      toast({
        title: "Ver turmas",
        description: `Visualizando turmas da disciplina ${disciplinaOfertada.disciplina?.nome}`,
      })
      // TODO: Em uma implementação futura, navegar para a página de turmas
    }
    setIsOpen(false)
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewTurmas}>
            <Book className="mr-2 h-4 w-4" />
            Ver turmas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de edição */}
      <CreateEditDisciplinaOfertadaFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        disciplinaOfertada={disciplinaOfertada}
      />

      {/* Diálogo de exclusão */}
      <DeleteDisciplinaOfertadaAlertDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        disciplinaOfertada={disciplinaOfertada}
      />
    </>
  )
}
