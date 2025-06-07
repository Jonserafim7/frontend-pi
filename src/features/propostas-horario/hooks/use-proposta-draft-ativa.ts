import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import {
  usePropostasHorarioControllerFindDraftAtiva,
  getPropostasHorarioControllerFindDraftAtivaQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type {
  PropostaHorarioResponseDto,
  PropostasHorarioControllerFindDraftAtivaParams,
} from "@/api-generated/model"

export interface UsePropostaDraftAtivaOptions {
  /**
   * ID do curso para buscar a proposta draft ativa
   */
  cursoId?: string
  /**
   * ID do período letivo para buscar a proposta draft ativa
   */
  periodoId?: string
  /**
   * Se deve habilitar a query automaticamente
   * @default true
   */
  enabled?: boolean
  /**
   * Callback executado quando a proposta é encontrada
   */
  onSuccess?: (data: PropostaHorarioResponseDto) => void
  /**
   * Callback executado quando ocorre um erro
   */
  onError?: (error: unknown) => void
}

/**
 * Hook customizado para buscar proposta de horário ativa em estado DRAFT.
 *
 * Este hook:
 * - Busca a proposta draft ativa para um curso e período específicos
 * - Só executa a query quando ambos cursoId e periodoId estão disponíveis
 * - Fornece gerenciamento de cache e invalidação
 * - Inclui estados de loading e error
 * - Permite habilitação/desabilitação condicional
 *
 * @param options - Opções de configuração do hook
 * @returns Resultado da query com dados, loading e error states
 */
export function usePropostaDraftAtiva(
  options: UsePropostaDraftAtivaOptions = {},
) {
  const { cursoId, periodoId, enabled = true, onSuccess, onError } = options
  const queryClient = useQueryClient()

  // Só busca se ambos os parâmetros estão disponíveis
  const shouldFetch = Boolean(cursoId && periodoId && enabled)

  const params: PropostasHorarioControllerFindDraftAtivaParams = {
    idCurso: cursoId || "",
    idPeriodoLetivo: periodoId || "",
  }

  const queryResult = usePropostasHorarioControllerFindDraftAtiva(params, {
    query: {
      enabled: shouldFetch,

      // Configurações de cache
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  })

  // Executar callbacks quando os dados mudarem
  useEffect(() => {
    if (onSuccess && queryResult.data && queryResult.isSuccess) {
      onSuccess(queryResult.data)
    }
  }, [onSuccess, queryResult.data, queryResult.isSuccess])

  useEffect(() => {
    if (onError && queryResult.error && queryResult.isError) {
      onError(queryResult.error)
    }
  }, [onError, queryResult.error, queryResult.isError])

  /**
   * Função para invalidar e recarregar a query manualmente
   */
  const invalidate = () => {
    if (shouldFetch) {
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindDraftAtivaQueryKey(params),
      })
    }
  }

  /**
   * Função para buscar novamente os dados (refetch)
   */
  const refetch = () => {
    return queryResult.refetch()
  }

  /**
   * Verifica se existe uma proposta draft ativa
   */
  const hasDraftAtiva = Boolean(queryResult.data)

  /**
   * Dados da proposta draft ativa (null se não encontrada)
   */
  const propostaDraft = queryResult.data || null

  return {
    // Dados principais
    data: propostaDraft,
    proposta: propostaDraft, // Alias para compatibilidade

    // Estados
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isSuccess: queryResult.isSuccess,
    isFetching: queryResult.isFetching,

    // Flags de conveniência
    hasDraftAtiva,
    isReady: shouldFetch,
    isEmpty: queryResult.isSuccess && !queryResult.data,

    // Funções de controle
    invalidate,
    refetch,

    // Query info
    queryKey: getPropostasHorarioControllerFindDraftAtivaQueryKey(params),

    // Status detalhado
    status: queryResult.status,
    fetchStatus: queryResult.fetchStatus,
  }
}

/**
 * Hook simples para verificar se existe proposta draft ativa
 * sem retornar os dados completos.
 */
export function useHasPropostaDraftAtiva(cursoId?: string, periodoId?: string) {
  const { hasDraftAtiva, isLoading, isError } = usePropostaDraftAtiva({
    cursoId,
    periodoId,
  })

  return {
    hasDraftAtiva,
    isLoading,
    isError,
  }
}
