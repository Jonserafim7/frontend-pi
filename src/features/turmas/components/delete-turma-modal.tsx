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
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import { useDeleteTurma } from "../hooks/use-turmas"
import type { TurmaResponseDto } from "@/api-generated/model"

interface DeleteTurmaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turma: TurmaResponseDto | null
  onSuccess?: () => void
}

/**
 * Modal de confirmação para deleção de turma
 */
export function DeleteTurmaModal({
  open,
  onOpenChange,
  turma,
  onSuccess,
}: DeleteTurmaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Hook para deletar turma
  const deleteTurmaMutation = useDeleteTurma()

  /**
   * Handler para confirmar deleção
   */
  const handleDelete = async () => {
    if (!turma) return

    try {
      setIsDeleting(true)

      await deleteTurmaMutation.mutateAsync({
        id: turma.id,
      })

      // Fechar modal e notificar sucesso
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao deletar turma:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Handler para cancelar
   */
  const handleCancel = () => {
    if (isDeleting) return // Não permitir cancelar durante deleção
    onOpenChange(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleCancel}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Deletar Turma
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Esta ação não pode ser desfeita.</span>
            </div>

            {turma && (
              <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Turma:</span>
                    <Badge variant="outline">{turma.codigoDaTurma}</Badge>
                  </div>

                  {turma.disciplinaOfertada?.disciplina?.nome && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Disciplina:</span>
                      <span>{turma.disciplinaOfertada.disciplina.nome}</span>
                    </div>
                  )}

                  {turma.disciplinaOfertada?.periodoLetivo && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Período:</span>
                      <span>
                        {turma.disciplinaOfertada.periodoLetivo.ano}/
                        {turma.disciplinaOfertada.periodoLetivo.semestre}º
                        Semestre
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-muted-foreground text-sm">
              Tem certeza de que deseja deletar esta turma? Todos os dados
              relacionados serão perdidos permanentemente.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deletando..." : "Sim, deletar turma"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
