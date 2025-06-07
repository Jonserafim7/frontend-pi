import { usePropostasHorarioControllerFindDraftAtiva } from "@/api-generated/client/propostas-horario/propostas-horario"
import type {
  PropostaHorarioResponseDto,
  PropostasHorarioControllerFindDraftAtivaParams,
} from "@/api-generated/model"

export interface UsePropostaDraftAtivaOptions {
  /** ID do curso para buscar a proposta draft ativa */
  cursoId?: string
  /** ID do período letivo para buscar a proposta draft ativa */
  periodoId?: string
  /** Se deve habilitar a query automaticamente */
  enabled?: boolean
}

export interface UsePropostaDraftAtivaReturn {
  /** Dados da proposta draft ativa */
  data: PropostaHorarioResponseDto | null
  /** Indica se está carregando */
  isLoading: boolean
  /** Indica se há erro */
  isError: boolean
  /** Objeto de erro, se houver */
  error: Error | null
  /** Se existe uma proposta draft ativa */
  hasDraftAtiva: boolean
  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
}

/**
 * Hook para buscar proposta de horário ativa em estado DRAFT
 * MVP: Versão simplificada sem cache complexo ou callbacks
 */
export function usePropostaDraftAtiva(
  options: UsePropostaDraftAtivaOptions = {},
): UsePropostaDraftAtivaReturn {
  const { cursoId, periodoId, enabled = true } = options

  // Só busca se ambos os parâmetros estão disponíveis
  const shouldFetch = Boolean(cursoId && periodoId && enabled)

  const params: PropostasHorarioControllerFindDraftAtivaParams = {
    idCurso: cursoId || "",
    idPeriodoLetivo: periodoId || "",
  }

  const { data, isLoading, isError, error, refetch } =
    usePropostasHorarioControllerFindDraftAtiva(params, {
      query: {
        enabled: shouldFetch,
        staleTime: 5 * 60 * 1000, // 5 minutos
      },
    })

  return {
    data: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    hasDraftAtiva: Boolean(data),
    refetch,
  }
}

/**
 * Hook simples para verificar se existe proposta draft ativa
 * MVP: Apenas verificação básica
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
