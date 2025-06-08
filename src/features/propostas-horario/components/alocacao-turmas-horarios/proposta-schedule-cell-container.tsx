"use client"

import * as React from "react"
import { ScheduleCellView } from "./schedule-cell-view"
import { ScheduleAllocationDialog } from "./schedule-allocation-dialog"
import { usePropostaAllocation } from "../../hooks/use-proposta-allocation"
import { useAlocacoesHorariosControllerFindByProposta } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { PropostaScheduleCellContainerProps } from "../../types/proposta-allocation-types"

/**
 * Container específico para células da grade de horários de propostas.
 *
 * Diferenças do container geral:
 * - Usa hook específico de propostas
 * - Filtra turmas do curso/período da proposta
 * - Valida permissões baseadas no status da proposta
 * - Associa alocações automaticamente à proposta
 * - Integra com validações de negócio específicas
 *
 * @component
 */
export function PropostaScheduleCellContainer({
  dia,
  horario,
  propostaId,
  readonly = false,
}: PropostaScheduleCellContainerProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [lastError, setLastError] = React.useState<string | null>(null)

  // Hook específico para alocações de propostas
  const {
    podeEditarProposta,
    isCreating,
    isDeleting,
    isValidating,
    isLoadingTurmas,
    getTurmasDisponiveis,
    criarAlocacao,
    removerAlocacao,
  } = usePropostaAllocation({ propostaId })

  // Buscar todas as alocações da proposta para validações
  const { data: alocacoesDaProposta = [] } =
    useAlocacoesHorariosControllerFindByProposta(propostaId, {
      query: {
        enabled: !!propostaId,
        staleTime: 30 * 1000, // 30 segundos
      },
    })

  /**
   * Determinar se há operação em andamento
   */
  const isLoading = isCreating || isDeleting || isLoadingTurmas

  /**
   * Preparar lista de alocações existentes para o slot
   */
  const alocacoesExistentes = React.useMemo(() => {
    // Buscar todas as alocações do slot atual
    return alocacoesDaProposta.filter(
      (alocacao) =>
        alocacao.diaDaSemana === dia &&
        alocacao.horaInicio === horario.inicio &&
        alocacao.horaFim === horario.fim,
    )
  }, [alocacoesDaProposta, dia, horario])

  /**
   * Preparar lista de turmas disponíveis para o slot
   */
  const turmasDisponiveis = React.useMemo(() => {
    const turmasLivres = getTurmasDisponiveis(
      dia,
      horario.inicio,
      horario.fim,
      alocacoesExistentes,
      alocacoesDaProposta,
    )

    // Mapear para o formato esperado pelo dialog
    return turmasLivres.map((turma) => ({
      id: turma.id,
      codigo: turma.codigoDaTurma,
      disciplina:
        turma.disciplinaOfertada?.disciplina?.nome || "Disciplina não informada",
      professor: turma.professorAlocado?.nome,
    }))
  }, [
    getTurmasDisponiveis,
    dia,
    horario,
    alocacoesExistentes,
    alocacoesDaProposta,
  ])

  /**
   * Limpar erro quando dialog abre
   */
  React.useEffect(() => {
    if (dialogOpen) {
      setLastError(null)
    }
  }, [dialogOpen])

  /**
   * Abre o dialog para gerenciar alocações (apenas se pode editar e não está readonly)
   */
  const handleAddClick = React.useCallback(() => {
    if (podeEditarProposta && !readonly) {
      setDialogOpen(true)
    }
  }, [podeEditarProposta, readonly])

  /**
   * Remove uma alocação específica
   */
  const handleRemoveClick = React.useCallback(
    async (alocacaoId: string) => {
      try {
        setLastError(null)
        await removerAlocacao(alocacaoId)
      } catch (error) {
        console.error(
          "❌ [PropostaScheduleCellContainer] Erro ao remover alocação:",
          error,
        )

        let errorMessage = "Erro desconhecido ao remover alocação"

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "string") {
          errorMessage = error
        }

        setLastError(errorMessage)
      }
    },
    [removerAlocacao],
  )

  /**
   * Criar nova alocação associada à proposta
   */
  const handleAlocarTurma = React.useCallback(
    async (turmaId: string) => {
      try {
        setLastError(null)
        await criarAlocacao(turmaId, dia, horario.inicio, horario.fim)
        setDialogOpen(false)
      } catch (error) {
        console.error(
          "❌ [PropostaScheduleCellContainer] Erro ao alocar turma:",
          error,
        )

        // Extrair mensagem de erro mais específica
        let errorMessage = "Erro desconhecido ao alocar turma"

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "string") {
          errorMessage = error
        }

        setLastError(errorMessage)
        // Não fechar o dialog para que o usuário veja o erro
      }
    },
    [criarAlocacao, dia, horario],
  )

  return (
    <>
      {/* Componente de apresentação com nova interface */}
      <ScheduleCellView
        alocacoes={alocacoesExistentes}
        onAddClick={handleAddClick}
        onRemoveClick={
          podeEditarProposta && !readonly ? handleRemoveClick : undefined
        }
        isLoading={isLoading}
        canEdit={podeEditarProposta && !readonly}
        readonly={readonly}
        data-testid={`schedule-cell-${dia}-${horario.inicio.replace(":", "")}`}
      />

      {/* Dialog para gerenciar alocações - só abre se pode editar */}
      {podeEditarProposta && (
        <ScheduleAllocationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          dia={dia}
          horario={horario}
          alocacoesExistentes={alocacoesExistentes}
          turmasDisponiveis={turmasDisponiveis}
          onAlocarTurma={handleAlocarTurma}
          onRemoverAlocacao={handleRemoveClick}
          isCreating={isCreating}
          isValidating={isValidating}
          lastError={lastError}
        />
      )}
    </>
  )
}
