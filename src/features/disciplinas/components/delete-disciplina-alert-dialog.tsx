import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useDisciplinasControllerRemove } from "@/api-generated/client/disciplinas/disciplinas"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { TriangleAlert } from "lucide-react"
import { getDisciplinasControllerFindAllQueryKey } from "@/api-generated/client/disciplinas/disciplinas"
import { useQueryClient } from "@tanstack/react-query"
import type { DisciplinaResponseDto } from "@/api-generated/model/disciplina-response-dto"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"

interface DeleteDisciplinaAlertDialogProps {
  disciplina: DisciplinaResponseDto
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Componente de diálogo para confirmação de exclusão de disciplina
 */
export function DeleteDisciplinaAlertDialog({
  disciplina,
  isOpen,
  onOpenChange,
}: DeleteDisciplinaAlertDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: removeDisciplina } = useDisciplinasControllerRemove()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "REMOVER"

  const handleDeleteDisciplina = () => {
    removeDisciplina(
      { id: disciplina.id },
      {
        onSuccess: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast.success("Disciplina removida com sucesso")
          queryClient.invalidateQueries({
            queryKey: getDisciplinasControllerFindAllQueryKey(),
          })
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Erro ao remover disciplina",
          )
        },
      },
    )
  }

  const handleCancel = () => {
    setConfirmationText("")
    onOpenChange(false)
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <TriangleAlert className="text-destructive" />
            <AlertDialogTitle>
              Tem certeza que deseja remover a disciplina?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá permanentemente excluir a
            disciplina <strong>{disciplina.nome}</strong> e remover seus dados do
            nosso servidor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="Digite REMOVER para confirmar"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed}
            onClick={handleDeleteDisciplina}
            className={cn(
              buttonVariants({
                variant: "destructive",
              }),
              !isConfirmed && "cursor-not-allowed opacity-50",
            )}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
