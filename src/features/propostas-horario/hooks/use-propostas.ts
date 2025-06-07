import { useMemo } from "react"
import {
  usePropostasHorarioControllerFindMinhasPropostas,
  usePropostasHorarioControllerFindAll,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"

export interface UsePropostasOptions {
  /** Habilitar/desabilitar a query */
  enabled?: boolean
}

export interface UsePropostasReturn {
  /** Lista de propostas do usuário */
  propostas: PropostaHorarioResponseDto[]
  /** Indica se está carregando */
  isLoading: boolean
  /** Indica se há erro */
  isError: boolean
  /** Objeto de erro, se houver */
  error: Error | null

  /** Contadores por status */
  contadores: {
    draft: number
    pendentes: number
    aprovadas: number
    rejeitadas: number
  }

  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
  /** Verificar se usuário pode visualizar todas as propostas */
  canViewAll: boolean
}

/**
 * Hook principal para carregar propostas baseado no papel do usuário
 * MVP: Coordenador vê apenas seu curso, Diretor vê todos os cursos
 */
export function usePropostas(
  options: UsePropostasOptions = {},
): UsePropostasReturn {
  const { enabled = true } = options
  const { user, isCoordenador, isDiretor, isAdmin } = useAuth()

  // Determinar se o usuário pode ver todas as propostas
  const canViewAll = useMemo(() => {
    return isDiretor() || isAdmin()
  }, [isDiretor, isAdmin])

  // Query para coordenadores (minhas propostas)
  const minhasPropostasQuery = usePropostasHorarioControllerFindMinhasPropostas(
    {},
    {
      query: {
        enabled: enabled && isCoordenador() && !!user,
        staleTime: 5 * 60 * 1000, // 5 minutos
        select: (data) => data || [],
      },
    },
  )

  // Query para diretores/admins (todas as propostas)
  const todasPropostasQuery = usePropostasHorarioControllerFindAll(
    {},
    {
      query: {
        enabled: enabled && canViewAll && !!user,
        staleTime: 5 * 60 * 1000, // 5 minutos
        select: (data) => data || [],
      },
    },
  )

  // Selecionar a query apropriada baseada no papel do usuário
  const activeQuery = canViewAll ? todasPropostasQuery : minhasPropostasQuery
  const { data: propostas = [], isLoading, isError, error, refetch } = activeQuery

  // Contadores por status
  const contadores = useMemo(() => {
    const draft = propostas.filter((p) => p.status === "DRAFT").length
    const pendentes = propostas.filter(
      (p) => p.status === "PENDENTE_APROVACAO",
    ).length
    const aprovadas = propostas.filter((p) => p.status === "APROVADA").length
    const rejeitadas = propostas.filter((p) => p.status === "REJEITADA").length

    return { draft, pendentes, aprovadas, rejeitadas }
  }, [propostas])

  return {
    propostas,
    isLoading,
    isError,
    error: error as Error | null,
    contadores,
    refetch,
    canViewAll,
  }
}
