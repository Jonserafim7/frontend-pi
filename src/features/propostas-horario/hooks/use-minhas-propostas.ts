import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  usePropostasHorarioControllerFindMinhasPropostas,
  usePropostasHorarioControllerFindAll,
  getPropostasHorarioControllerFindMinhasPropostasQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type {
  PropostaHorarioResponseDto,
  PropostaHorarioResponseDtoStatus,
  PropostasHorarioControllerFindMinhasPropostasParams,
  PropostasHorarioControllerFindAllParams,
} from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"

export interface UseMinhasPropostasOptions {
  /** Filtrar por status específico */
  status?: PropostaHorarioResponseDtoStatus
  /** Filtrar por curso específico */
  idCurso?: string
  /** Filtrar por período letivo específico */
  idPeriodoLetivo?: string
  /** Filtrar por coordenador específico (apenas para diretores/admins) */
  idCoordenador?: string
  /** Habilitar/desabilitar a query */
  enabled?: boolean
  /** Configurações de refetch */
  refetchInterval?: number
  /** Tempo de stale em milissegundos (padrão: 5 minutos) */
  staleTime?: number
  /** Tempo de garbage collection em milissegundos (padrão: 10 minutos) */
  gcTime?: number
}

export interface UseMinhasPropostasReturn {
  // Data
  /** Lista de propostas do usuário */
  propostas: PropostaHorarioResponseDto[]
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

  // Propostas agrupadas por status
  /** Propostas em rascunho */
  propostasDraft: PropostaHorarioResponseDto[]
  /** Propostas pendentes de aprovação */
  propostasPendentes: PropostaHorarioResponseDto[]
  /** Propostas aprovadas */
  propostasAprovadas: PropostaHorarioResponseDto[]
  /** Propostas rejeitadas */
  propostasRejeitadas: PropostaHorarioResponseDto[]

  // Contadores
  /** Total de propostas */
  totalPropostas: number
  /** Contadores por status */
  contadores: {
    draft: number
    pendentes: number
    aprovadas: number
    rejeitadas: number
  }

  // Utilities
  /** Forçar refetch dos dados */
  refetch: () => Promise<unknown>
  /** Invalidar cache */
  invalidate: () => Promise<void>
  /** Buscar proposta específica por ID */
  findPropostaById: (id: string) => PropostaHorarioResponseDto | undefined
  /** Verificar se usuário pode visualizar todas as propostas */
  canViewAll: boolean
}

/**
 * Hook para buscar propostas do usuário atual com filtros opcionais
 *
 * Funcionalidades:
 * - Busca propostas do coordenador autenticado ou todas (para diretores/admins)
 * - Filtros por status, curso, período
 * - Cache inteligente com invalidação automática
 * - Agrupamento automático por status
 * - Contadores por status
 * - Utilities para manipulação de dados
 *
 * @param options Opções de filtros e configuração
 * @returns Dados das propostas e utilitários
 */
export function useMinhasPropostas(
  options: UseMinhasPropostasOptions = {},
): UseMinhasPropostasReturn {
  const {
    status,
    idCurso,
    idPeriodoLetivo,
    idCoordenador,
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutos
    gcTime = 10 * 60 * 1000, // 10 minutos
  } = options

  const { user, isCoordenador, isDiretor, isAdmin } = useAuth()
  const queryClient = useQueryClient()

  // Determinar se o usuário pode ver todas as propostas
  const canViewAll = useMemo(() => {
    return isDiretor() || isAdmin()
  }, [isDiretor, isAdmin])

  // Parâmetros base para queries
  const baseParams = useMemo(() => {
    const params:
      | PropostasHorarioControllerFindMinhasPropostasParams
      | PropostasHorarioControllerFindAllParams = {
      ...(status && { status }),
      ...(idCurso && { idCurso }),
      ...(idPeriodoLetivo && { idPeriodoLetivo }),
    }

    // Para diretores/admins, adicionar filtro de coordenador se especificado
    if (canViewAll && idCoordenador) {
      ;(params as PropostasHorarioControllerFindAllParams).idCoordenador =
        idCoordenador
    }

    return params
  }, [status, idCurso, idPeriodoLetivo, idCoordenador, canViewAll])

  // Query para coordenadores (minhas propostas)
  const minhasPropostasQuery = usePropostasHorarioControllerFindMinhasPropostas(
    baseParams as PropostasHorarioControllerFindMinhasPropostasParams,
    {
      query: {
        enabled: enabled && isCoordenador() && !!user,
        staleTime,
        gcTime,
        refetchInterval,
        select: (data) => data || [],
      },
    },
  )

  // Query para diretores/admins (todas as propostas)
  const todasPropostasQuery = usePropostasHorarioControllerFindAll(
    baseParams as PropostasHorarioControllerFindAllParams,
    {
      query: {
        enabled: enabled && canViewAll && !!user,
        staleTime,
        gcTime,
        refetchInterval,
        select: (data) => data || [],
      },
    },
  )

  // Selecionar a query apropriada baseada no papel do usuário
  const activeQuery = canViewAll ? todasPropostasQuery : minhasPropostasQuery

  const {
    data: propostas = [],
    isLoading,
    isError,
    error,
    isInitialLoading,
    isRefetching,
    refetch,
  } = activeQuery

  // Agrupar propostas por status
  const propostasByStatus = useMemo(() => {
    const draft: PropostaHorarioResponseDto[] = []
    const pendentes: PropostaHorarioResponseDto[] = []
    const aprovadas: PropostaHorarioResponseDto[] = []
    const rejeitadas: PropostaHorarioResponseDto[] = []

    propostas.forEach((proposta) => {
      switch (proposta.status) {
        case "DRAFT":
          draft.push(proposta)
          break
        case "PENDENTE_APROVACAO":
          pendentes.push(proposta)
          break
        case "APROVADA":
          aprovadas.push(proposta)
          break
        case "REJEITADA":
          rejeitadas.push(proposta)
          break
      }
    })

    return { draft, pendentes, aprovadas, rejeitadas }
  }, [propostas])

  // Contadores
  const contadores = useMemo(
    () => ({
      draft: propostasByStatus.draft.length,
      pendentes: propostasByStatus.pendentes.length,
      aprovadas: propostasByStatus.aprovadas.length,
      rejeitadas: propostasByStatus.rejeitadas.length,
    }),
    [propostasByStatus],
  )

  // Invalidar cache
  const invalidate = useCallback(async () => {
    const invalidationPromises = []

    if (canViewAll) {
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(
            baseParams as PropostasHorarioControllerFindAllParams,
          ),
        }),
      )
    } else {
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindMinhasPropostasQueryKey(
            baseParams as PropostasHorarioControllerFindMinhasPropostasParams,
          ),
        }),
      )
    }

    await Promise.all(invalidationPromises)
  }, [queryClient, canViewAll, baseParams])

  // Buscar proposta por ID
  const findPropostaById = useCallback(
    (id: string): PropostaHorarioResponseDto | undefined => {
      return propostas.find((proposta) => proposta.id === id)
    },
    [propostas],
  )

  return {
    // Data
    propostas,
    isLoading,
    isError,
    error: error as Error | null,
    isInitialLoading,
    isRefetching,

    // Propostas agrupadas
    propostasDraft: propostasByStatus.draft,
    propostasPendentes: propostasByStatus.pendentes,
    propostasAprovadas: propostasByStatus.aprovadas,
    propostasRejeitadas: propostasByStatus.rejeitadas,

    // Contadores
    totalPropostas: propostas.length,
    contadores,

    // Utilities
    refetch,
    invalidate,
    findPropostaById,
    canViewAll,
  }
}
