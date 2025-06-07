import * as React from "react"
import { toast } from "sonner"
import { ScheduleCellView } from "./schedule-cell-view"
import { AlocacaoDialog } from "./alocacao-dialog"
import { useScheduleAllocation } from "../hooks/use-schedule-allocation"
import type { ScheduleCellProps } from "./schedule-grid-types"

export function ScheduleCellContainer({
  dia,
  horario,
  alocacao,
  alocacoes = [],
  propostaId,
}: ScheduleCellProps & {
  propostaId: string
  alocacoes?: any[]
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { isLoadingTurmas, isCreating, isDeleting, removerAlocacao } =
    useScheduleAllocation({ propostaId })

  const isLoading = isCreating || isDeleting || isLoadingTurmas
  const alocacoesExistentes = React.useMemo(() => {
    if (alocacoes && alocacoes.length > 0) {
      return alocacoes
    }
    return alocacao ? [alocacao] : []
  }, [alocacoes, alocacao])

  const handleAddClick = React.useCallback(() => {
    setDialogOpen(true)
  }, [])
  const handleRemoveAlocacao = React.useCallback(
    async (alocacaoId: string) => {
      try {
        if (!removerAlocacao) {
          toast.error("Função de remoção não disponível")
          return
        }

        await removerAlocacao(alocacaoId)
        toast.success("Alocação removida com sucesso")
      } catch (error) {
        console.error("Erro ao remover alocação:", error)
        toast.error("Erro ao remover alocação")
      }
    },
    [removerAlocacao],
  )

  return (
    <div data-testid={`celula-${dia}-${horario.inicio.replace(":", "")}`}>
      {/* Componente de apresentação */}
      <ScheduleCellView
        alocacoes={alocacoesExistentes}
        onAddClick={handleAddClick}
        onRemoveAlocacao={handleRemoveAlocacao}
        isLoading={isLoading}
      />

      {/* Dialog para gerenciar alocações */}
      <AlocacaoDialog
        propostaId={propostaId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dia={dia}
        horario={horario}
        alocacoesExistentes={alocacoesExistentes}
      />
    </div>
  )
}
