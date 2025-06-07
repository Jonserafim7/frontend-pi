import { useMemo } from "react"
import {
  useCursosControllerFindCursosDoCoordenador,
  getCursosControllerFindCursosDoCoordenadorQueryKey,
} from "@/api-generated/client/cursos/cursos"
import { useQueryClient } from "@tanstack/react-query"
import type { CursoResponseDto } from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"

export interface UseCoordenadorCursosOptions {
  /** Habilitar/desabilitar a query */
  enabled?: boolean
  /** Tempo de stale em milissegundos (padrão: 5 minutos) */
  staleTime?: number
  /** Tempo de garbage collection em milissegundos (padrão: 10 minutos) */
  gcTime?: number
}

export interface UseCoordenadorCursosReturn {
  // Data
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
  /** Indica se é um fetch inicial */
  isInitialLoading: boolean
  /** Indica se está fazendo refetch */
  isRefetching: boolean

  // Status
  /** Se o coordenador tem cursos associados */
  hasCursos: boolean
  /** Número total de cursos */
  totalCursos: number

  // Utilities
  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
  /** Invalidar cache */
  invalidate: () => Promise<void>
  /** Buscar curso por ID */
  findCursoById: (id: string) => CursoResponseDto | undefined
}

/**
 * Hook para buscar os cursos que o coordenador autenticado coordena
 *
 * Funcionalidades:
 * - Busca automática dos cursos do coordenador
 * - Cache inteligente com invalidação
 * - Acesso fácil ao curso principal (primeiro)
 * - Utilities para manipulação de dados
 * - Apenas funciona para usuários com papel COORDENADOR
 *
 * @param options Configurações opcionais
 * @returns Dados dos cursos e utilitários
 */
export function useCoordenadorCursos(
  options: UseCoordenadorCursosOptions = {},
): UseCoordenadorCursosReturn {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    gcTime = 10 * 60 * 1000, // 10 minutos
  } = options

  const { user, isCoordenador } = useAuth()
  const queryClient = useQueryClient()

  // Query para buscar cursos do coordenador
  const {
    data: cursos = [],
    isLoading,
    isError,
    error,
    isInitialLoading,
    isRefetching,
    refetch,
  } = useCursosControllerFindCursosDoCoordenador({
    query: {
      enabled: enabled && isCoordenador() && !!user,
      staleTime,
      gcTime,
      select: (data) => data || [],
    },
  })

  // Dados derivados
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

  // Utilities
  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: getCursosControllerFindCursosDoCoordenadorQueryKey(),
    })
  }

  const findCursoById = (id: string): CursoResponseDto | undefined => {
    return cursos.find((curso) => curso.id === id)
  }

  return {
    // Data
    cursos,
    cursoPrincipal,
    cursoPrincipalId,
    isLoading,
    isError,
    error: error as Error | null,
    isInitialLoading,
    isRefetching,

    // Status
    hasCursos,
    totalCursos,

    // Utilities
    refetch,
    invalidate,
    findCursoById,
  }
}

/**
 * Hook simplificado para obter apenas o ID do curso principal do coordenador
 *
 * @param enabled Se a query deve estar habilitada
 * @returns ID do curso principal ou undefined
 */
export function useCursoPrincipalId(enabled: boolean = true): string | undefined {
  const { cursoPrincipalId } = useCoordenadorCursos({
    enabled,
    staleTime: 10 * 60 * 1000, // Cache mais longo para uso simples
  })

  return cursoPrincipalId
}

/**
 * Hook simplificado para verificar se o coordenador tem cursos
 *
 * @param enabled Se a query deve estar habilitada
 * @returns true se tem cursos, false caso contrário
 */
export function useTemCursos(enabled: boolean = true): boolean {
  const { hasCursos } = useCoordenadorCursos({
    enabled,
    staleTime: 10 * 60 * 1000, // Cache mais longo para uso simples
  })

  return hasCursos
}
