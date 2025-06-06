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
import { Loader2, TriangleAlert } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { usePeriodosLetivosControllerRemove } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import type { PeriodoLetivoResponseDto } from "@/api-generated/model/periodo-letivo-response-dto"
import { getPeriodosLetivosControllerFindAllQueryKey } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface DeletePeriodoLetivoAlertDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  periodoLetivo: PeriodoLetivoResponseDto
}

/**
 * Diálogo de alerta para confirmar exclusão de um período letivo
 */
export function DeletePeriodoLetivoAlertDialog({
  isOpen,
  onOpenChange,
  periodoLetivo,
}: DeletePeriodoLetivoAlertDialogProps) {
  const queryClient = useQueryClient()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "EXCLUIR"
  const { mutate: mutateRemove, isPending: isRemoving } =
    usePeriodosLetivosControllerRemove()

  // Handler para confirmar a exclusão
  const handleDelete = async () => {
    mutateRemove(
      { id: periodoLetivo.id },
      {
        onSuccess: () => {
          toast.success("Período Letivo excluído")
          queryClient.invalidateQueries({
            queryKey: getPeriodosLetivosControllerFindAllQueryKey(),
          })
          onOpenChange(false)
          setConfirmationText("")
        },
        onError: (error) => {
          const errorMessage =
            error?.message || "Ocorreu um erro ao excluir o período letivo"
          toast.error(errorMessage)
        },
      },
    )
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
            <AlertDialogTitle>Excluir período letivo</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o período letivo{" "}
            <strong>
              {periodoLetivo?.ano}/{periodoLetivo?.semestre}
            </strong>
            ? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="Digite EXCLUIR para confirmar"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmationText("")
              onOpenChange(false)
            }}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed || isRemoving}
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
            {isRemoving ?
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
