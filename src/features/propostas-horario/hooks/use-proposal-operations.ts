import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  usePropostasHorarioControllerCreate,
  usePropostasHorarioControllerEnviar,
  usePropostasHorarioControllerAprovar,
  usePropostasHorarioControllerRejeitar,
  getPropostasHorarioControllerFindMinhasPropostasQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
  getPropostasHorarioControllerFindOneQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type {
  CreatePropostaHorarioDto,
  PropostaHorarioResponseDto,
  AprovarPropostaDto,
  RejeitarPropostaDto,
} from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"

export interface UseProposalOperationsOptions {
  /** Callbacks opcionais para eventos */
  onSuccess?: {
    create?: (proposta: PropostaHorarioResponseDto) => void
    submit?: (proposta: PropostaHorarioResponseDto) => void
    approve?: (proposta: PropostaHorarioResponseDto) => void
    reject?: (proposta: PropostaHorarioResponseDto) => void
  }
  onError?: {
    create?: (error: Error) => void
    submit?: (error: Error) => void
    approve?: (error: Error) => void
    reject?: (error: Error) => void
  }
  /** Configurações de otimização */
  enableOptimisticUpdates?: boolean
  /** Configurações de toast */
  showToasts?: boolean
  /** Configurações de invalidação de cache */
  autoInvalidate?: boolean
}

export interface CreatePropostaOptions {
  idCurso: string
  idPeriodoLetivo: string
  observacoesCoordenador?: string
}

export interface AprovarPropostaOptions {
  id: string
  observacoesDiretor?: string
}

export interface RejeitarPropostaOptions {
  id: string
  justificativaRejeicao: string
  observacoesDiretor?: string
}

export interface UseProposalOperationsReturn {
  // Create operation
  createProposta: (
    options: CreatePropostaOptions,
  ) => Promise<PropostaHorarioResponseDto>
  isCreating: boolean
  createError: Error | null

  // Submit operation (enviar para aprovação)
  submitProposta: (id: string) => Promise<PropostaHorarioResponseDto>
  isSubmitting: boolean
  submitError: Error | null

  // Approve operation
  approveProposta: (
    options: AprovarPropostaOptions,
  ) => Promise<PropostaHorarioResponseDto>
  isApproving: boolean
  approveError: Error | null

  // Reject operation
  rejectProposta: (
    options: RejeitarPropostaOptions,
  ) => Promise<PropostaHorarioResponseDto>
  isRejecting: boolean
  rejectError: Error | null

  // Combined states
  isOperating: boolean
  hasErrors: boolean

  // Utilities
  invalidateAll: () => Promise<void>
  reset: () => void
}

/**
 * Hook para operações de propostas de horário
 *
 * Funcionalidades:
 * - Criação de propostas
 * - Envio para aprovação
 * - Aprovação de propostas
 * - Rejeição de propostas
 * - Updates otimistas
 * - Invalidação inteligente de cache
 * - Tratamento de erros unificado
 * - Feedback com toasts
 *
 * @param options Configurações opcionais
 * @returns Operações e estados
 */
export function useProposalOperations(
  options: UseProposalOperationsOptions = {},
): UseProposalOperationsReturn {
  const {
    onSuccess,
    onError,
    enableOptimisticUpdates = true,
    showToasts = true,
    autoInvalidate = true,
  } = options

  const { user, isCoordenador, isDiretor, isAdmin } = useAuth()
  const queryClient = useQueryClient()

  // Mutations
  const createMutation = usePropostasHorarioControllerCreate()
  const submitMutation = usePropostasHorarioControllerEnviar()
  const approveMutation = usePropostasHorarioControllerAprovar()
  const rejectMutation = usePropostasHorarioControllerRejeitar()

  // Invalidar todas as queries relacionadas
  const invalidateAll = useCallback(async () => {
    const invalidationPromises = []

    // Invalidar queries das propostas
    invalidationPromises.push(
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindMinhasPropostasQueryKey(),
      }),
    )

    // Para diretores/admins, também invalidar todas as propostas
    if (isDiretor() || isAdmin()) {
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        }),
      )
    }

    // Invalidar draft ativa - simplificado
    invalidationPromises.push(
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "propostas-horario",
      }),
    )

    await Promise.all(invalidationPromises)
  }, [queryClient, isDiretor, isAdmin, isCoordenador])

  // Criar nova proposta
  const createProposta = useCallback(
    async (
      createOptions: CreatePropostaOptions,
    ): Promise<PropostaHorarioResponseDto> => {
      try {
        const createData: CreatePropostaHorarioDto = {
          idCurso: createOptions.idCurso,
          idPeriodoLetivo: createOptions.idPeriodoLetivo,
          observacoesCoordenador: createOptions.observacoesCoordenador,
        }

        // Skip optimistic update for create to avoid type complexity
        // The mutation will handle cache invalidation properly

        const result = await createMutation.mutateAsync({ data: createData })

        if (showToasts) {
          toast.success("Proposta criada com sucesso")
        }

        if (autoInvalidate) {
          await invalidateAll()
        }

        onSuccess?.create?.(result)
        return result
      } catch (error) {
        if (showToasts) {
          toast.error("Erro ao criar proposta")
        }

        // Rollback optimistic update
        if (enableOptimisticUpdates) {
          await invalidateAll()
        }

        onError?.create?.(error as Error)
        throw error
      }
    },
    [
      createMutation,
      enableOptimisticUpdates,
      user,
      queryClient,
      showToasts,
      autoInvalidate,
      invalidateAll,
      onSuccess,
      onError,
    ],
  )

  // Enviar proposta para aprovação
  const submitProposta = useCallback(
    async (id: string): Promise<PropostaHorarioResponseDto> => {
      try {
        // Optimistic update
        if (enableOptimisticUpdates) {
          queryClient.setQueryData(
            getPropostasHorarioControllerFindOneQueryKey(id),
            (old: PropostaHorarioResponseDto | undefined) => {
              if (!old) return old
              return {
                ...old,
                status: "PENDENTE_APROVACAO" as const,
                dataSubmissao: new Date().toISOString(),
              }
            },
          )
        }

        const result = await submitMutation.mutateAsync({ id })

        if (showToasts) {
          toast.success("Proposta enviada para aprovação")
        }

        if (autoInvalidate) {
          await invalidateAll()
        }

        onSuccess?.submit?.(result)
        return result
      } catch (error) {
        if (showToasts) {
          toast.error("Erro ao enviar proposta")
        }

        // Rollback optimistic update
        if (enableOptimisticUpdates) {
          await invalidateAll()
        }

        onError?.submit?.(error as Error)
        throw error
      }
    },
    [
      submitMutation,
      enableOptimisticUpdates,
      queryClient,
      showToasts,
      autoInvalidate,
      invalidateAll,
      onSuccess,
      onError,
    ],
  )

  // Aprovar proposta
  const approveProposta = useCallback(
    async (
      approveOptions: AprovarPropostaOptions,
    ): Promise<PropostaHorarioResponseDto> => {
      try {
        const approveData: AprovarPropostaDto = {
          observacoesDiretor: approveOptions.observacoesDiretor,
        }

        // Optimistic update
        if (enableOptimisticUpdates) {
          queryClient.setQueryData(
            getPropostasHorarioControllerFindOneQueryKey(approveOptions.id),
            (old: PropostaHorarioResponseDto | undefined) => {
              if (!old) return old
              return {
                ...old,
                status: "APROVADA" as const,
                dataAprovacaoRejeicao: new Date().toISOString(),
                observacoesDiretor: approveOptions.observacoesDiretor || null,
                justificativaRejeicao: null,
              }
            },
          )
        }

        const result = await approveMutation.mutateAsync({
          id: approveOptions.id,
          data: approveData,
        })

        if (showToasts) {
          toast.success("Proposta aprovada com sucesso")
        }

        if (autoInvalidate) {
          await invalidateAll()
        }

        onSuccess?.approve?.(result)
        return result
      } catch (error) {
        if (showToasts) {
          toast.error("Erro ao aprovar proposta")
        }

        // Rollback optimistic update
        if (enableOptimisticUpdates) {
          await invalidateAll()
        }

        onError?.approve?.(error as Error)
        throw error
      }
    },
    [
      approveMutation,
      enableOptimisticUpdates,
      queryClient,
      showToasts,
      autoInvalidate,
      invalidateAll,
      onSuccess,
      onError,
    ],
  )

  // Rejeitar proposta
  const rejectProposta = useCallback(
    async (
      rejectOptions: RejeitarPropostaOptions,
    ): Promise<PropostaHorarioResponseDto> => {
      try {
        const rejectData: RejeitarPropostaDto = {
          justificativaRejeicao: rejectOptions.justificativaRejeicao,
          observacoesDiretor: rejectOptions.observacoesDiretor,
        }

        // Optimistic update
        if (enableOptimisticUpdates) {
          queryClient.setQueryData(
            getPropostasHorarioControllerFindOneQueryKey(rejectOptions.id),
            (old: PropostaHorarioResponseDto | undefined) => {
              if (!old) return old
              return {
                ...old,
                status: "REJEITADA" as const,
                dataAprovacaoRejeicao: new Date().toISOString(),
                justificativaRejeicao: rejectOptions.justificativaRejeicao,
                observacoesDiretor: rejectOptions.observacoesDiretor || null,
              }
            },
          )
        }

        const result = await rejectMutation.mutateAsync({
          id: rejectOptions.id,
          data: rejectData,
        })

        if (showToasts) {
          toast.success("Proposta rejeitada")
        }

        if (autoInvalidate) {
          await invalidateAll()
        }

        onSuccess?.reject?.(result)
        return result
      } catch (error) {
        if (showToasts) {
          toast.error("Erro ao rejeitar proposta")
        }

        // Rollback optimistic update
        if (enableOptimisticUpdates) {
          await invalidateAll()
        }

        onError?.reject?.(error as Error)
        throw error
      }
    },
    [
      rejectMutation,
      enableOptimisticUpdates,
      queryClient,
      showToasts,
      autoInvalidate,
      invalidateAll,
      onSuccess,
      onError,
    ],
  )

  // Reset all mutations
  const reset = useCallback(() => {
    createMutation.reset()
    submitMutation.reset()
    approveMutation.reset()
    rejectMutation.reset()
  }, [createMutation, submitMutation, approveMutation, rejectMutation])

  // Computed states
  const isOperating =
    createMutation.isPending ||
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending

  const hasErrors =
    !!createMutation.error ||
    !!submitMutation.error ||
    !!approveMutation.error ||
    !!rejectMutation.error

  return {
    // Create operation
    createProposta,
    isCreating: createMutation.isPending,
    createError: createMutation.error as Error | null,

    // Submit operation
    submitProposta,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error as Error | null,

    // Approve operation
    approveProposta,
    isApproving: approveMutation.isPending,
    approveError: approveMutation.error as Error | null,

    // Reject operation
    rejectProposta,
    isRejecting: rejectMutation.isPending,
    rejectError: rejectMutation.error as Error | null,

    // Combined states
    isOperating,
    hasErrors,

    // Utilities
    invalidateAll,
    reset,
  }
}
