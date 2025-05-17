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
import { useUsuariosControllerRemove } from "@/api-generated/client/usuarios/usuarios"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { TriangleAlert } from "lucide-react"
import { getUsuariosControllerFindAllQueryKey } from "@/api-generated/client/usuarios/usuarios"
import { useQueryClient } from "@tanstack/react-query"
import type { UsuarioResponseDto } from "@/api-generated/model"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface DeleteUserAlertDialogProps {
  user: UsuarioResponseDto
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserAlertDialog({
  user,
  isOpen,
  onOpenChange,
}: DeleteUserAlertDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: removeUser } = useUsuariosControllerRemove()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "REMOVER"
  const { toast } = useToast()

  const handleDeleteUser = () => {
    removeUser(
      { id: user.id },
      {
        onSuccess: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast({
            title: "Usuário removido com sucesso",
            description: "O usuário foi removido com sucesso.",
          })
          queryClient.invalidateQueries({
            queryKey: getUsuariosControllerFindAllQueryKey(),
          })
        },
        onError: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast({
            title: "Erro",
            description: "Erro ao remover o usuário.",
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
            <AlertDialogTitle>
              Tem certeza que deseja remover o usuário?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá permanentemente excluir o
            usuário e remover seus dados do nosso servidor.
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
            onClick={handleDeleteUser}
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
