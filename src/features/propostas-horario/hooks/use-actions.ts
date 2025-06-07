import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  usePropostasHorarioControllerEnviar,
  usePropostasHorarioControllerAprovar,
  usePropostasHorarioControllerRejeitar,
  getPropostasHorarioControllerFindMinhasPropostasQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type {
  PropostaHorarioResponseDto,
  AprovarPropostaDto,
  RejeitarPropostaDto,
} from "@/api-generated/model"

export interface AprovarPropostaOptions {
  id: string
  observacoesDiretor?: string
}

export interface RejeitarPropostaOptions {
  id: string
  justificativaRejeicao: string
  observacoesDiretor?: string
}

export interface UseActionsReturn {
  /** Enviar proposta para aprovação */
  submitProposta: (id: string) => Promise<PropostaHorarioResponseDto>
  /** Aprovar proposta */
  approveProposta: (
    options: AprovarPropostaOptions,
  ) => Promise<PropostaHorarioResponseDto>
  /** Rejeitar proposta */
  rejectProposta: (
    options: RejeitarPropostaOptions,
  ) => Promise<PropostaHorarioResponseDto>

  /** Estados de carregamento */
  isSubmitting: boolean
  isApproving: boolean
  isRejecting: boolean
  isOperating: boolean
}

/**
 * Hook para ações de propostas de horário
 * MVP: Ações básicas com feedback por toast
 */
export function useActions(): UseActionsReturn {
  const queryClient = useQueryClient()

  // Mutations
  const submitMutation = usePropostasHorarioControllerEnviar()
  const approveMutation = usePropostasHorarioControllerAprovar()
  const rejectMutation = usePropostasHorarioControllerRejeitar()

  // Invalidar cache após operações
  const invalidateCache = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindMinhasPropostasQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindAllQueryKey(),
      }),
    ])
  }, [queryClient])

  // Enviar proposta para aprovação
  const submitProposta = useCallback(
    async (id: string): Promise<PropostaHorarioResponseDto> => {
      try {
        const result = await submitMutation.mutateAsync({ id })

        toast.success("Proposta enviada para aprovação")
        await invalidateCache()

        return result
      } catch (error) {
        toast.error("Erro ao enviar proposta")
        throw error
      }
    },
    [submitMutation, invalidateCache],
  )

  // Aprovar proposta
  const approveProposta = useCallback(
    async (
      options: AprovarPropostaOptions,
    ): Promise<PropostaHorarioResponseDto> => {
      try {
        const approveData: AprovarPropostaDto = {
          observacoesDiretor: options.observacoesDiretor,
        }

        const result = await approveMutation.mutateAsync({
          id: options.id,
          data: approveData,
        })

        toast.success("Proposta aprovada com sucesso")
        await invalidateCache()

        return result
      } catch (error) {
        toast.error("Erro ao aprovar proposta")
        throw error
      }
    },
    [approveMutation, invalidateCache],
  )

  // Rejeitar proposta
  const rejectProposta = useCallback(
    async (
      options: RejeitarPropostaOptions,
    ): Promise<PropostaHorarioResponseDto> => {
      try {
        const rejectData: RejeitarPropostaDto = {
          justificativaRejeicao: options.justificativaRejeicao,
          observacoesDiretor: options.observacoesDiretor,
        }

        const result = await rejectMutation.mutateAsync({
          id: options.id,
          data: rejectData,
        })

        toast.success("Proposta rejeitada")
        await invalidateCache()

        return result
      } catch (error) {
        toast.error("Erro ao rejeitar proposta")
        throw error
      }
    },
    [rejectMutation, invalidateCache],
  )

  return {
    submitProposta,
    approveProposta,
    rejectProposta,
    isSubmitting: submitMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isOperating:
      submitMutation.isPending ||
      approveMutation.isPending ||
      rejectMutation.isPending,
  }
}
