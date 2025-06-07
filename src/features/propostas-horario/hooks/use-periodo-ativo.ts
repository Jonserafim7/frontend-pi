import { useMemo } from "react"
import {
  usePeriodosLetivosControllerFindPeriodoAtivo,
  getPeriodosLetivosControllerFindPeriodoAtivoQueryKey,
} from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { useQueryClient } from "@tanstack/react-query"
import type { PeriodoLetivoResponseDto } from "@/api-generated/model"

export interface UsePeriodoAtivoOptions {
  /** Habilitar/desabilitar a query */
  enabled?: boolean
  /** Tempo de stale em milissegundos (padrão: 10 minutos) */
  staleTime?: number
  /** Tempo de garbage collection em milissegundos (padrão: 15 minutos) */
  gcTime?: number
  /** Intervalo de refetch em milissegundos (padrão: desabilitado) */
  refetchInterval?: number
}

export interface UsePeriodoAtivoReturn {
  // Data
  /** Dados do período letivo ativo */
  periodoAtivo: PeriodoLetivoResponseDto | undefined
  /** ID do período letivo ativo */
  periodoAtivoId: string | undefined
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

  // Status
  /** Se existe período ativo */
  hasPeríodoAtivo: boolean
  /** String formatada do período (ex: "2024/1") */
  periodoFormatado: string | undefined

  // Utilities
  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
  /** Invalidar cache */
  invalidate: () => Promise<void>
}

/**
 * Hook para buscar o período letivo ativo atual
 *
 * Funcionalidades:
 * - Busca automática do período letivo ativo
 * - Cache inteligente com invalidação
 * - Acesso fácil ao ID do período ativo
 * - Formatting helpers para exibição
 * - Utilities para manipulação de dados
 *
 * @param options Configurações opcionais
 * @returns Dados do período ativo e utilitários
 */
export function usePeriodoAtivo(
  options: UsePeriodoAtivoOptions = {},
): UsePeriodoAtivoReturn {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutos - período não muda com frequência
    gcTime = 15 * 60 * 1000, // 15 minutos
    refetchInterval,
  } = options

  const queryClient = useQueryClient()

  // Query para buscar período ativo
  const {
    data: periodoAtivo,
    isLoading,
    isError,
    error,
    isInitialLoading,
    isRefetching,
    refetch,
  } = usePeriodosLetivosControllerFindPeriodoAtivo({
    query: {
      enabled,
      staleTime,
      gcTime,
      refetchInterval,
    },
  })

  // Dados derivados
  const periodoAtivoId = useMemo(() => {
    return periodoAtivo?.id
  }, [periodoAtivo])

  const hasPeríodoAtivo = useMemo(() => {
    return !!periodoAtivo
  }, [periodoAtivo])

  const periodoFormatado = useMemo(() => {
    if (!periodoAtivo) return undefined
    return `${periodoAtivo.ano}/${periodoAtivo.semestre}`
  }, [periodoAtivo])

  // Utilities
  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: getPeriodosLetivosControllerFindPeriodoAtivoQueryKey(),
    })
  }

  return {
    // Data
    periodoAtivo,
    periodoAtivoId,
    isLoading,
    isError,
    error: error as Error | null,
    isInitialLoading,
    isRefetching,

    // Status
    hasPeríodoAtivo,
    periodoFormatado,

    // Utilities
    refetch,
    invalidate,
  }
}

/**
 * Hook simplificado para obter apenas o ID do período letivo ativo
 *
 * @param enabled Se a query deve estar habilitada
 * @returns ID do período ativo ou undefined
 */
export function usePeriodoAtivoId(enabled: boolean = true): string | undefined {
  const { periodoAtivoId } = usePeriodoAtivo({
    enabled,
    staleTime: 15 * 60 * 1000, // Cache mais longo para uso simples
  })

  return periodoAtivoId
}

/**
 * Hook simplificado para obter a string formatada do período ativo
 *
 * @param enabled Se a query deve estar habilitada
 * @returns String formatada (ex: "2024/1") ou undefined
 */
export function usePeriodoAtivoFormatado(
  enabled: boolean = true,
): string | undefined {
  const { periodoFormatado } = usePeriodoAtivo({
    enabled,
    staleTime: 15 * 60 * 1000, // Cache mais longo para uso simples
  })

  return periodoFormatado
}
