import { useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  usePropostasHorarioControllerCalcularCompletude,
  getPropostasHorarioControllerCalcularCompletudeQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type { PropostasHorarioControllerCalcularCompletude200 } from "@/api-generated/model"

export interface UseProposalCompletenessOptions {
  /** ID da proposta */
  proposalId: string
  /** Habilitar/desabilitar a query */
  enabled?: boolean
  /** Intervalo de refetch em milissegundos */
  refetchInterval?: number
  /** Tempo de stale em milissegundos (padrão: 2 minutos) */
  staleTime?: number
  /** Tempo de garbage collection em milissegundos (padrão: 5 minutos) */
  gcTime?: number
  /** Callback quando a completude muda */
  onCompletudeChange?: (completude: number) => void
  /** Threshold para considerar como "pronto para envio" (padrão: 80%) */
  readyThreshold?: number
}

export interface UseProposalCompletenessReturn {
  // Data
  /** Dados de completude */
  data: PropostasHorarioControllerCalcularCompletude200 | undefined
  /** Porcentagem de completude (0-100) */
  completeness: number
  /** Indica se está carregando */
  isLoading: boolean
  /** Indica se há erro */
  isError: boolean
  /** Objeto de erro, se houver */
  error: Error | null
  /** Indica se é um fetch inicial */
  isInitialLoading: boolean
  /** Indica se está fazendo refetch */
  isRefetching: boolean

  // Status calculados
  /** Se a proposta está pronta para envio */
  isReadyForSubmission: boolean
  /** Se está abaixo do threshold mínimo */
  isBelowThreshold: boolean
  /** Porcentagem faltante para atingir o threshold */
  missingPercentage: number

  // Breakdown detalhado
  /** Total de horas requeridas */
  totalRequiredHours: number
  /** Total de horas alocadas */
  totalAllocatedHours: number
  /** Horas faltantes */
  missingHours: number

  // Utilities
  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
  /** Invalidar cache */
  invalidate: () => Promise<void>
  /** Verificar se completude mudou significativamente */
  hasSignificantChange: (threshold?: number) => boolean
}

/**
 * Hook para monitorar a completude de uma proposta de horário
 *
 * Funcionalidades:
 * - Monitoramento em tempo real da completude
 * - Cálculo automático de status (pronto/não pronto)
 * - Breakdown detalhado de horas
 * - Callbacks para mudanças de completude
 * - Cache inteligente com invalidação
 *
 * @param options Configurações da completude
 * @returns Dados de completude e utilitários
 */
export function useProposalCompleteness(
  options: UseProposalCompletenessOptions,
): UseProposalCompletenessReturn {
  const {
    proposalId,
    enabled = true,
    refetchInterval,
    staleTime = 2 * 60 * 1000, // 2 minutos
    gcTime = 5 * 60 * 1000, // 5 minutos
    onCompletudeChange,
    readyThreshold = 80,
  } = options

  const queryClient = useQueryClient()

  // Query para buscar completude
  const {
    data,
    isLoading,
    isError,
    error,
    isInitialLoading,
    isRefetching,
    refetch,
  } = usePropostasHorarioControllerCalcularCompletude(proposalId, {
    query: {
      enabled: enabled && !!proposalId,
      staleTime,
      gcTime,
      refetchInterval,
      select: (response) => response,
    },
  })

  // Calcular métricas derivadas
  const completeness = data?.percentualCompleto ?? 0
  const totalRequiredHours = data?.totalAulasNecessarias ?? 0
  const totalAllocatedHours = data?.aulasAlocadas ?? 0
  const missingHours = Math.max(0, totalRequiredHours - totalAllocatedHours)

  // Status calculados
  const isReadyForSubmission = completeness >= readyThreshold
  const isBelowThreshold = completeness < readyThreshold
  const missingPercentage = Math.max(0, readyThreshold - completeness)

  // Callback para mudanças na completude
  useEffect(() => {
    if (data && onCompletudeChange) {
      onCompletudeChange(completeness)
    }
  }, [completeness, data, onCompletudeChange])

  // Invalidar cache
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey:
        getPropostasHorarioControllerCalcularCompletudeQueryKey(proposalId),
    })
  }, [queryClient, proposalId])

  // Verificar mudança significativa na completude
  const hasSignificantChange = useCallback(
    (threshold: number = 5): boolean => {
      const cachedData = queryClient.getQueryData(
        getPropostasHorarioControllerCalcularCompletudeQueryKey(proposalId),
      ) as PropostasHorarioControllerCalcularCompletude200 | undefined

      if (!cachedData || !data) return false

      const previousCompleteness = cachedData.percentualCompleto ?? 0
      const currentCompleteness = data.percentualCompleto ?? 0

      return Math.abs(currentCompleteness - previousCompleteness) >= threshold
    },
    [queryClient, proposalId, data],
  )

  return {
    // Data
    data,
    completeness,
    isLoading,
    isError,
    error: error as Error | null,
    isInitialLoading,
    isRefetching,

    // Status calculados
    isReadyForSubmission,
    isBelowThreshold,
    missingPercentage,

    // Breakdown detalhado
    totalRequiredHours,
    totalAllocatedHours,
    missingHours,

    // Utilities
    refetch,
    invalidate,
    hasSignificantChange,
  }
}

/**
 * Hook simplificado para apenas obter a porcentagem de completude
 *
 * @param proposalId ID da proposta
 * @param enabled Se a query deve estar habilitada
 * @returns Porcentagem de completude (0-100)
 */
export function useProposalCompletenessPercentage(
  proposalId: string,
  enabled: boolean = true,
): number {
  const { completeness } = useProposalCompleteness({
    proposalId,
    enabled,
    staleTime: 5 * 60 * 1000, // Cache mais longo para uso simples
  })

  return completeness
}

/**
 * Hook para verificar se uma proposta está pronta para envio
 *
 * @param proposalId ID da proposta
 * @param threshold Threshold mínimo (padrão: 80%)
 * @param enabled Se a query deve estar habilitada
 * @returns Se está pronta para envio
 */
export function useIsProposalReadyForSubmission(
  proposalId: string,
  threshold: number = 80,
  enabled: boolean = true,
): boolean {
  const { isReadyForSubmission } = useProposalCompleteness({
    proposalId,
    enabled,
    readyThreshold: threshold,
  })

  return isReadyForSubmission
}
