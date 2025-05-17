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
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useCursosControllerRemove } from "@/api-generated/client/cursos/cursos"
import type { CursoResponseDto } from "@/api-generated/model/curso-response-dto"
import { getCursosControllerFindAllQueryKey } from "@/api-generated/client/cursos/cursos"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface DeleteCourseAlertDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  course: CursoResponseDto
}

/**
 * Diálogo de alerta para confirmar exclusão de um curso
 */
export function DeleteCourseAlertDialog({
  isOpen,
  onOpenChange,
  course,
}: DeleteCourseAlertDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "EXCLUIR"
  const { mutate: mutateRemove, isPending: isRemoving } =
    useCursosControllerRemove()

  // Handler para confirmar a exclusão
  const handleDelete = async () => {
    mutateRemove(
      { id: course.id },
      {
        onSuccess: () => {
          toast({
            title: "Curso excluído",
            description: "O curso foi excluído com sucesso",
          })
          queryClient.invalidateQueries({
            queryKey: getCursosControllerFindAllQueryKey(),
          })
          onOpenChange(false)
        },
        onError: (error) => {
          const errorMessage =
            error?.message || "Ocorreu um erro ao excluir o curso"
          toast({
            title: "Erro ao excluir curso",
            description: errorMessage,
            variant: "destructive",
          })
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
            <AlertDialogTitle>Excluir curso</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o curso <strong>{course?.nome}</strong>
            ? Esta ação não pode ser desfeita.
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
                <Loader2 className="animate-spin" />
                Excluindo...
              </>
            : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
