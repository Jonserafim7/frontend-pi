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
  alocacao,
  propostaId,
}: PropostaScheduleCellContainerProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Hook específico para alocações de propostas
  const {
    podeEditarProposta,
    isCreating,
    isDeleting,
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
    return alocacao ? [alocacao] : []
  }, [alocacao])

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
   * Abre o dialog para gerenciar alocações (apenas se pode editar)
   */
  const handleCellClick = React.useCallback(() => {
    if (podeEditarProposta) {
      setDialogOpen(true)
    }
  }, [podeEditarProposta])

  /**
   * Criar nova alocação associada à proposta
   */
  const handleAlocarTurma = React.useCallback(
    async (turmaId: string) => {
      try {
        await criarAlocacao(turmaId, dia, horario.inicio, horario.fim)
        setDialogOpen(false)
      } catch (error) {
        // Error handling é feito no hook
        console.error("Erro ao alocar turma:", error)
      }
    },
    [criarAlocacao, dia, horario],
  )

  /**
   * Remover alocação existente
   */
  const handleRemoverAlocacao = React.useCallback(
    async (alocacaoId: string) => {
      try {
        await removerAlocacao(alocacaoId)
      } catch (error) {
        // Error handling é feito no hook
        console.error("Erro ao remover alocação:", error)
      }
    },
    [removerAlocacao],
  )

  return (
    <>
      {/* Componente de apresentação */}
      <ScheduleCellView
        alocacao={alocacao}
        onCellClick={handleCellClick}
        isLoading={isLoading}
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
          onRemoverAlocacao={handleRemoverAlocacao}
        />
      )}
    </>
  )
}
