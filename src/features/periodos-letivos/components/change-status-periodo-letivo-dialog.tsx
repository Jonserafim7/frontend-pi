import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQueryClient } from "@tanstack/react-query"
import {
  getPeriodosLetivosControllerFindAllQueryKey,
  usePeriodosLetivosControllerChangeStatus,
} from "@/api-generated/client/períodos-letivos/períodos-letivos"
import type {
  PeriodoLetivoResponseDto,
  ChangeStatusPeriodoLetivoDtoStatus,
} from "@/api-generated/model"
import type { AxiosError } from "axios"
import { AlertTriangleIcon } from "lucide-react"
import { toast } from "sonner"

interface ChangeStatusPeriodoLetivoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodoLetivo: PeriodoLetivoResponseDto
  newStatus: ChangeStatusPeriodoLetivoDtoStatus
}

/**
 * Componente de diálogo para confirmar mudança de status de um Período Letivo.
 * Permite ativar ou desativar um período letivo com confirmação do usuário.
 */
export const ChangeStatusPeriodoLetivoDialog: React.FC<
  ChangeStatusPeriodoLetivoDialogProps
> = ({ open, onOpenChange, periodoLetivo, newStatus }) => {
  const { mutate: mutateChangeStatus, isPending } =
    usePeriodosLetivosControllerChangeStatus()
  const queryClient = useQueryClient()

  const isActivating = newStatus === "ATIVO"
  const currentStatusText = periodoLetivo.status === "ATIVO" ? "ativo" : "inativo"
  const newStatusText = isActivating ? "ativo" : "inativo"

  const handleConfirm = () => {
    mutateChangeStatus(
      {
        id: periodoLetivo.id,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(
            `Período letivo ${isActivating ? "ativado" : "desativado"} com sucesso!`,
          )
          queryClient.invalidateQueries({
            queryKey: getPeriodosLetivosControllerFindAllQueryKey(),
          })
          onOpenChange(false)
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            "Erro ao alterar status do período letivo"
          toast.error(errorMessage)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            <DialogTitle>
              {isActivating ? "Ativar" : "Desativar"} Período Letivo
            </DialogTitle>
          </div>
          <DialogDescription>
            {isActivating ?
              <>
                Tem certeza que deseja <strong>ativar</strong> o período letivo{" "}
                <strong>
                  {periodoLetivo.ano}/{periodoLetivo.semestre}
                </strong>
                ?
                <br />
                <br />
                <span className="leading-relaxed text-amber-600 dark:text-amber-400">
                  Apenas um período letivo pode estar ativo por vez. Se houver
                  outro período ativo, ele será automaticamente desativado.
                </span>
              </>
            : <>
                Tem certeza que deseja <strong>desativar</strong> o período letivo{" "}
                <strong>
                  {periodoLetivo.ano}/{periodoLetivo.semestre}
                </strong>
                ?
                <br />
                <br />O período está atualmente {currentStatusText}.
              </>
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant={isActivating ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ?
              "Processando..."
            : isActivating ?
              "Ativar"
            : "Desativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
