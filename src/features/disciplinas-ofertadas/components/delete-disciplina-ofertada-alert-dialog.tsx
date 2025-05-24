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
import { useDisciplinasOfertadasControllerRemove } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { TriangleAlert } from "lucide-react"
import { getDisciplinasOfertadasControllerFindAllQueryKey } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import { useQueryClient } from "@tanstack/react-query"
import type { DisciplinaOfertadaResponseDto } from "@/api-generated/model/disciplina-ofertada-response-dto"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface DeleteDisciplinaOfertadaAlertDialogProps {
  disciplinaOfertada: DisciplinaOfertadaResponseDto
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Componente de diálogo para confirmação de exclusão de disciplina ofertada
 *
 * @param disciplinaOfertada - A disciplina ofertada a ser excluída
 * @param isOpen - Estado que controla a visibilidade do diálogo
 * @param onOpenChange - Função para alterar o estado de visibilidade
 */
export function DeleteDisciplinaOfertadaAlertDialog({
  disciplinaOfertada,
  isOpen,
  onOpenChange,
}: DeleteDisciplinaOfertadaAlertDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: removeDisciplinaOfertada } =
    useDisciplinasOfertadasControllerRemove()
  const [confirmationText, setConfirmationText] = useState("")
  const isConfirmed = confirmationText === "REMOVER"
  const { toast } = useToast()

  // Detalhes formatados da disciplina ofertada para exibição
  const disciplinaDisplay =
    disciplinaOfertada.disciplina?.nome || "Disciplina não identificada"
  const periodoDisplay =
    disciplinaOfertada.periodoLetivo ?
      `${disciplinaOfertada.periodoLetivo.ano}/${disciplinaOfertada.periodoLetivo.semestre}`
    : "Período não identificado"

  // Função para lidar com a exclusão da disciplina ofertada
  const handleDelete = () => {
    removeDisciplinaOfertada(
      { id: disciplinaOfertada.id },
      {
        onSuccess: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast({
            title: "Disciplina ofertada removida",
            description: "A disciplina ofertada foi removida com sucesso.",
          })
          queryClient.invalidateQueries({
            queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
          })
        },
        onError: () => {
          setConfirmationText("")
          onOpenChange(false)
          toast({
            title: "Erro ao remover",
            description:
              "Não foi possível remover a disciplina ofertada. Verifique se ela não possui turmas associadas.",
            variant: "destructive",
          })
        },
      },
    )
  }

  // Função para lidar com o cancelamento da exclusão
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
              Tem certeza que deseja remover esta oferta de disciplina?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá permanentemente excluir a
            oferta de <strong>{disciplinaDisplay}</strong> do período{" "}
            <strong>{periodoDisplay}</strong> e remover seus dados do servidor.
            {disciplinaOfertada.quantidadeTurmas > 0 && (
              <span className="text-destructive mt-2 block">
                Atenção: Esta oferta possui {disciplinaOfertada.quantidadeTurmas}{" "}
                turma(s) associada(s) que também serão excluídas.
              </span>
            )}
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
            onClick={handleDelete}
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
