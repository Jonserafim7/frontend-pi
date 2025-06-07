import { useMemo } from "react"
import { useCursosControllerFindCursosDoCoordenador } from "@/api-generated/client/cursos/cursos"
import type { CursoResponseDto } from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"

export interface UseCoordenadorCursosOptions {
  /** Habilitar/desabilitar a query */
  enabled?: boolean
  /** Tempo de stale em milissegundos (padrão: 5 minutos) */
  staleTime?: number
}

export interface UseCoordenadorCursosReturn {
  /** Lista de cursos do coordenador */
  cursos: CursoResponseDto[]
  /** Primeiro curso (principal) do coordenador */
  cursoPrincipal: CursoResponseDto | undefined
  /** ID do primeiro curso */
  cursoPrincipalId: string | undefined
  /** Indica se está carregando */
  isLoading: boolean
  /** Indica se há erro */
  isError: boolean
  /** Objeto de erro, se houver */
  error: Error | null

  /** Se o coordenador tem cursos associados */
  hasCursos: boolean
  /** Número total de cursos */
  totalCursos: number

  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
}

/**
 * Hook para buscar os cursos que o coordenador autenticado coordena
 * MVP: Apenas funcionalidade essencial, sem filtros ou validações complexas
 */
export function useCoordenadorCursos(
  options: UseCoordenadorCursosOptions = {},
): UseCoordenadorCursosReturn {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
  } = options

  const { user, isCoordenador } = useAuth()

  // Query para buscar cursos do coordenador
  const {
    data: cursos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCursosControllerFindCursosDoCoordenador({
    query: {
      enabled: enabled && isCoordenador() && !!user,
      staleTime,
      select: (data) => data || [],
    },
  })

  // Dados derivados básicos
  const cursoPrincipal = useMemo(() => {
    return cursos.length > 0 ? cursos[0] : undefined
  }, [cursos])

  const cursoPrincipalId = useMemo(() => {
    return cursoPrincipal?.id
  }, [cursoPrincipal])

  const hasCursos = useMemo(() => {
    return cursos.length > 0
  }, [cursos])

  const totalCursos = useMemo(() => {
    return cursos.length
  }, [cursos])

  return {
    // Data
    cursos,
    cursoPrincipal,
    cursoPrincipalId,
    isLoading,
    isError,
    error: error as Error | null,

    // Status
    hasCursos,
    totalCursos,

    // Utilities
    refetch,
  }
}
