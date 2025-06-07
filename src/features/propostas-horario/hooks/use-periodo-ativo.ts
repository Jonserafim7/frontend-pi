import { useMemo } from "react"
import { usePeriodosLetivosControllerFindPeriodoAtivo } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import type { PeriodoLetivoResponseDto } from "@/api-generated/model"

export interface UsePeriodoAtivoOptions {
  /** Habilitar/desabilitar a query */
  enabled?: boolean
  /** Tempo de stale em milissegundos (padrão: 10 minutos) */
  staleTime?: number
}

export interface UsePeriodoAtivoReturn {
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

  /** Se existe período ativo */
  hasPeríodoAtivo: boolean
  /** String formatada do período (ex: "2024/1") */
  periodoFormatado: string | undefined

  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
}

/**
 * Hook simplificado para buscar o período letivo ativo atual
 * Versão MVP sem utilities complexas
 */
export function usePeriodoAtivo(
  options: UsePeriodoAtivoOptions = {},
): UsePeriodoAtivoReturn {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutos - período não muda com frequência
  } = options

  // Query para buscar período ativo
  const {
    data: periodoAtivo,
    isLoading,
    isError,
    error,
    refetch,
  } = usePeriodosLetivosControllerFindPeriodoAtivo({
    query: {
      enabled,
      staleTime,
    },
  })

  // Dados derivados básicos
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

  return {
    // Data
    periodoAtivo,
    periodoAtivoId,
    isLoading,
    isError,
    error: error as Error | null,

    // Status
    hasPeríodoAtivo,
    periodoFormatado,

    // Utilities
    refetch,
  }
}

/**
 * Hook simplificado para obter apenas o ID do período letivo ativo
 * MVP: Versão mais simples sem configurações avançadas
 */
export function usePeriodoAtivoId(enabled: boolean = true): string | undefined {
  const { periodoAtivoId } = usePeriodoAtivo({ enabled })
  return periodoAtivoId
}
