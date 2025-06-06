import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { TriangleAlert, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  useTurmasControllerRemove,
  getTurmasControllerFindAllQueryKey,
} from "@/api-generated/client/turmas/turmas"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Propriedades do alert dialog de deleção de turma
 */
interface DeleteTurmaAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turmaId: string
  turmaCode: string
}

/**
 * Alert dialog para confirmação de deleção de turma
 */
export function DeleteTurmaAlertDialog({
  open,
  onOpenChange,
  turmaId,
  turmaCode,
}: DeleteTurmaAlertDialogProps) {
  const queryClient = useQueryClient()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "EXCLUIR"

  const { mutate: deleteTurma, isPending: isDeleting } =
    useTurmasControllerRemove()

  const handleDelete = () => {
    deleteTurma(
      { id: turmaId },
      {
        onSuccess: () => {
          toast.success(`A turma "${turmaCode}" foi excluída com sucesso.`)
          queryClient.invalidateQueries({
            queryKey: getTurmasControllerFindAllQueryKey(),
          })
          setConfirmationText("")
          onOpenChange(false)
        },
        onError: (error) => {
          const errorMessage =
            error?.message ||
            "A turma pode estar em uso por outras entidades do sistema."
          toast.error(errorMessage)
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
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <TriangleAlert className="text-destructive" />
            <AlertDialogTitle>Excluir turma</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a turma <strong>{turmaCode}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="Digite EXCLUIR para confirmar"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed || isDeleting}
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className={cn(
              !isConfirmed && "cursor-not-allowed opacity-50",
              buttonVariants({
                variant: "destructive",
              }),
            )}
          >
            {isDeleting ?
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
