import * as React from "react"
import { toast } from "sonner"
import { ScheduleCellView } from "./schedule-cell-view"
import { ScheduleAllocationDialog } from "./schedule-allocation-dialog"
import { useScheduleAllocation } from "../hooks/use-schedule-allocation"
import type { ScheduleCellProps } from "./schedule-grid-types"

/**
 * Container que gerencia estado e lógica para uma célula da grade de horários.
 *
 * Responsabilidades:
 * - Gerenciar estado do dialog de alocações
 * - Integrar com hooks de API para alocações
 * - Preparar dados para o combobox de turmas
 * - Tratar callbacks de criação/remoção de alocações
 * - Gerenciar estados de loading e error
 * - Suportar múltiplas alocações por célula
 *
 * @component
 */
export function ScheduleCellContainer({
  dia,
  horario,
  alocacao,
  alocacoes = [],
  propostaId,
  todasAlocacoes = [],
}: ScheduleCellProps & {
  propostaId: string
  todasAlocacoes?: any[]
  alocacoes?: any[]
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { isLoadingTurmas, isCreating, isDeleting, removerAlocacao } =
    useScheduleAllocation(propostaId)

  /**
   * Determinar se há operação em andamento
   */
  const isLoading = isCreating || isDeleting || isLoadingTurmas

  /**
   * Preparar lista de alocações existentes para o slot
   * Prioriza array de alocacoes, mas mantém compatibilidade com alocacao única
   */
  const alocacoesExistentes = React.useMemo(() => {
    if (alocacoes && alocacoes.length > 0) {
      return alocacoes
    }
    return alocacao ? [alocacao] : []
  }, [alocacoes, alocacao])

  /**
   * Abre o dialog para adicionar nova alocação
   */
  const handleAddClick = React.useCallback(() => {
    setDialogOpen(true)
  }, [])

  /**
   * Remove uma alocação específica
   */
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
    <>
      {/* Componente de apresentação */}
      <ScheduleCellView
        alocacoes={alocacoesExistentes}
        onAddClick={handleAddClick}
        onRemoveAlocacao={handleRemoveAlocacao}
        isLoading={isLoading}
      />

      {/* Dialog para gerenciar alocações */}
      <ScheduleAllocationDialog
        propostaId={propostaId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dia={dia}
        horario={horario}
        alocacoesExistentes={alocacoesExistentes}
        todasAlocacoes={todasAlocacoes}
      />
    </>
  )
}
