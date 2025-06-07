import { useState } from "react"
import { MoreHorizontal, Pencil, Trash, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateEditTurmaFormDialog } from "../create-edit-turma-form-dialog"
import { DeleteTurmaAlertDialog } from "../delete-turma-alert-dialog"
import { AtribuirProfessorDialog } from "../atribuir-professor-dialog"
import {
  useTurmasControllerRemoverProfessor,
  getTurmasControllerFindAllQueryKey,
} from "@/api-generated/client/turmas/turmas"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Propriedades para o menu de ações da turma
 */
interface TurmaActionRowDropdownMenuProps {
  turmaId: string
  turmaCode: string
  disciplinaNome?: string
  professorAlocado: boolean
}

/**
 * Menu de ações para cada linha na tabela de turmas
 */
export function TurmaActionRowDropdownMenu({
  turmaId,
  turmaCode,
  disciplinaNome,
  professorAlocado,
}: TurmaActionRowDropdownMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAtribuirProfessorModalOpen, setIsAtribuirProfessorModalOpen] =
    useState(false)

  const queryClient = useQueryClient()

  const { mutate: removerProfessor } = useTurmasControllerRemoverProfessor()

  const handleRemoverProfessor = async () => {
    removerProfessor(
      { id: turmaId },
      {
        onSuccess: () => {
          toast.success("Professor removido")
          queryClient.invalidateQueries({
            queryKey: getTurmasControllerFindAllQueryKey(),
          })
        },
        onError: (error) => {
          toast.error(error?.message || "Ocorreu um erro ao remover o professor.")
        },
      },
    )
  }

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
          <DropdownMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Pencil className="mr-2" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setIsAtribuirProfessorModalOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <UserPlus className="mr-2" />
            {professorAlocado ? "Alterar Professor" : "Atribuir Professor"}
          </DropdownMenuItem>

          {professorAlocado && (
            <DropdownMenuItem
              onClick={handleRemoverProfessor}
              className="flex cursor-pointer items-center gap-2"
            >
              <UserMinus className="mr-2" />
              Remover Professor
            </DropdownMenuItem>
          )}

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
        <CreateEditTurmaFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          turmaId={turmaId}
        />
      )}

      {isAtribuirProfessorModalOpen && (
        <AtribuirProfessorDialog
          open={isAtribuirProfessorModalOpen}
          onOpenChange={setIsAtribuirProfessorModalOpen}
          turma={
            {
              id: turmaId,
              codigoDaTurma: turmaCode,
              disciplinaOfertada: {
                disciplina: {
                  nome: disciplinaNome || "",
                },
              },
            } as any
          }
          onSuccess={() => {
            // Refresh data if needed
          }}
        />
      )}

      <DeleteTurmaAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        turmaId={turmaId}
        turmaCode={turmaCode}
      />
    </>
  )
}
