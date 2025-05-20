import { useToast } from "@/hooks/use-toast"
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
import { useMatrizesCurricularesControllerRemove } from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { getMatrizesCurricularesControllerFindAllQueryKey } from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"

/**
 * Propriedades para o diálogo de exclusão de matriz curricular
 */
interface DeleteMatrizCurricularAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matrizCurricularId: string
  matrizCurricularName: string
}

/**
 * Componente de diálogo de alerta para confirmar exclusão de uma matriz curricular
 */
export function DeleteMatrizCurricularAlertDialog({
  open,
  onOpenChange,
  matrizCurricularId,
  matrizCurricularName,
}: DeleteMatrizCurricularAlertDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "EXCLUIR"
  const { mutate: deleteMatrizCurricular, isPending: isDeleting } = useMatrizesCurricularesControllerRemove()

  /**
   * Manipula a operação de exclusão da matriz curricular
   */
  const handleDelete = () => {
    deleteMatrizCurricular(
      { id: matrizCurricularId },
      {
        onSuccess: () => {
          toast({
            title: "Matriz curricular excluída",
            description: `A matriz curricular "${matrizCurricularName}" foi excluída com sucesso.`,
          })
          queryClient.invalidateQueries({
            queryKey: getMatrizesCurricularesControllerFindAllQueryKey(),
          })
          onOpenChange(false)
        },
        onError: (error) => {
          const errorMessage =
            error?.message || "A matriz curricular pode estar em uso por outras entidades do sistema."
          toast({
            title: "Erro ao excluir matriz curricular",
            description: errorMessage,
            variant: "destructive",
          })
        },
      },
    )
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
            <AlertDialogTitle>Excluir matriz curricular</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a matriz curricular <strong>{matrizCurricularName}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="Digite EXCLUIR para confirmar"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
