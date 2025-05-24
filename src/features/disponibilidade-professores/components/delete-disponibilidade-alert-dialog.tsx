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
import { useDisponibilidadeProfessorControllerRemove } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { TriangleAlert } from "lucide-react"
import { getDisponibilidadeProfessorControllerFindAllQueryKey } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { useQueryClient } from "@tanstack/react-query"
import type { DisponibilidadeResponseDto } from "@/api-generated/model/disponibilidade-response-dto"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface DeleteDisponibilidadeAlertDialogProps {
  disponibilidade: DisponibilidadeResponseDto
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Componente de diálogo para confirmação de exclusão de disponibilidade de professor
 */
export function DeleteDisponibilidadeAlertDialog({
  disponibilidade,
  isOpen,
  onOpenChange,
}: DeleteDisponibilidadeAlertDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: removeDisponibilidade } =
    useDisponibilidadeProfessorControllerRemove()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "REMOVER"
  const { toast } = useToast()

  const handleDeleteDisponibilidade = () => {
    removeDisponibilidade(
      { id: disponibilidade.id },
      {
        onSuccess: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast({
            title: "Disponibilidade removida com sucesso",
            description: "A disponibilidade foi removida com sucesso.",
          })
          queryClient.invalidateQueries({
            queryKey: getDisponibilidadeProfessorControllerFindAllQueryKey(),
          })
        },
        onError: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast({
            title: "Erro",
            description: "Erro ao remover a disponibilidade.",
            variant: "destructive",
          })
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
            <AlertDialogTitle className="leading-normal">
              Tem certeza que deseja remover esta disponibilidade?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="leading-normal whitespace-pre-line">
            Esta ação não pode ser desfeita. Isso irá excluir permanentemente a
            disponibilidade do professor{" "}
            <strong>{disponibilidade.usuarioProfessor?.nome ?? ""}</strong> no
            semestre{" "}
            <strong>{disponibilidade.periodoLetivo?.semestre ?? ""}</strong> das{" "}
            <strong>{disponibilidade.horaInicio}</strong> às{" "}
            <strong>{disponibilidade.horaFim}</strong>.
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
            onClick={handleDeleteDisponibilidade}
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
