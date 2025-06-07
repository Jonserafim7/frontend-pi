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

        toast.success("✅ Proposta enviada com sucesso!", {
          description:
            "Sua proposta está agora na lista de pendentes aguardando análise da diretoria.",
        })
        await invalidateCache()

        return result
      } catch (error) {
        console.error("Erro ao enviar proposta:", error)

        // Mensagem de erro mais específica baseada no tipo de erro
        const errorMessage =
          error instanceof Error && error.message.includes("400") ?
            "Não é possível enviar uma proposta vazia. Adicione pelo menos uma alocação de horário."
          : "Não foi possível enviar a proposta. Verifique sua conexão e tente novamente."

        toast.error("❌ Falha ao enviar proposta", {
          description: errorMessage,
        })
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

        toast.success("🎉 Proposta aprovada!", {
          description:
            "A proposta foi movida para a lista de aprovadas. O horário pode ser implementado.",
        })
        await invalidateCache()

        return result
      } catch (error) {
        console.error("Erro ao aprovar proposta:", error)

        const errorMessage =
          error instanceof Error && error.message.includes("404") ?
            "Esta proposta não foi encontrada. Ela pode ter sido removida ou modificada."
          : "Não foi possível aprovar a proposta. Tente novamente em alguns instantes."

        toast.error("❌ Falha na aprovação", {
          description: errorMessage,
        })
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

        toast.success("📋 Proposta rejeitada", {
          description:
            "A proposta foi movida para a lista de rejeitadas com a justificativa registrada.",
        })
        await invalidateCache()

        return result
      } catch (error) {
        console.error("Erro ao rejeitar proposta:", error)

        const errorMessage =
          error instanceof Error && error.message.includes("404") ?
            "Esta proposta não foi encontrada. Ela pode ter sido removida ou modificada."
          : "Não foi possível rejeitar a proposta. Verifique se a justificativa foi preenchida corretamente."

        toast.error("❌ Falha na rejeição", {
          description: errorMessage,
        })
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
