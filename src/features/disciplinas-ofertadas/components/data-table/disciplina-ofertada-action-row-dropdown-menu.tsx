import { MoreHorizontal, Pencil, Trash2, Book } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"
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
import { DeleteDisciplinaOfertadaAlertDialog } from "../delete-disciplina-ofertada-alert-dialog"
import { EditDisciplinaOfertadaDialog } from "../edit-disciplina-ofertada-dialog"
import { toast } from "sonner"

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
  const navigate = useNavigate()
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
      // Navegar para a página de turmas com filtro aplicado
      const disciplinaNome = disciplinaOfertada.disciplina?.nome || ""
      const disciplinaCodigo = disciplinaOfertada.disciplina?.codigo || ""

      // Usar o nome da disciplina como filtro (mais específico)
      const filtro = disciplinaNome || disciplinaCodigo

      if (filtro) {
        navigate(`/coordenador/turmas?filtro=${encodeURIComponent(filtro)}`)

        toast.info(`Visualizando turmas da disciplina ${disciplinaNome}`)
      } else {
        // Fallback caso não tenha nome da disciplina
        navigate("/coordenador/turmas")

        toast.info("Redirecionando para a página de turmas")
      }
    }
    setIsOpen(false)
  }

  return (
    <>
      <DropdownMenu
        open={isOpen}
        onOpenChange={setIsOpen}
      >
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
      <EditDisciplinaOfertadaDialog
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
