"use client"

import * as React from "react"
import { toast } from "sonner"
import { ScheduleCellView } from "./schedule-cell-view"
import { ScheduleAllocationDialog } from "./schedule-allocation-dialog"
import { useScheduleAllocation } from "../../hooks/use-schedule-allocation"
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
 *
 * @component
 */
export function ScheduleCellContainer({
  dia,
  horario,
  alocacao,
}: ScheduleCellProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const {
    isLoadingTurmas,
    isCreating,
    isDeleting,
    getTurmasDisponiveis,
    criarAlocacao,
    removerAlocacao,
  } = useScheduleAllocation()

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
    )

    // Mapear para o formato esperado pelo dialog
    return turmasLivres.map((turma) => ({
      id: turma.id,
      codigo: turma.codigoDaTurma,
      disciplina:
        turma.disciplinaOfertada?.disciplina?.nome || "Disciplina não informada",
      professor: turma.professorAlocado?.nome,
    }))
  }, [getTurmasDisponiveis, dia, horario, alocacoesExistentes])

  /**
   * Abre o dialog para gerenciar alocações
   */
  const handleCellClick = React.useCallback(() => {
    setDialogOpen(true)
  }, [])

  /**
   * Criar nova alocação
   */
  const handleAlocarTurma = React.useCallback(
    async (turmaId: string) => {
      try {
        await criarAlocacao(turmaId, dia, horario.inicio, horario.fim)
        toast.success("Turma alocada com sucesso!")
        setDialogOpen(false)
      } catch (error) {
        console.error("Erro ao alocar turma:", error)
        toast.error(
          error instanceof Error ? error.message : "Erro ao alocar turma",
        )
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
        toast.success("Alocação removida com sucesso!")
      } catch (error) {
        console.error("Erro ao remover alocação:", error)
        toast.error(
          error instanceof Error ? error.message : "Erro ao remover alocação",
        )
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

      {/* Dialog para gerenciar alocações */}
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
    </>
  )
}
