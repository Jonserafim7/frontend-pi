import { useAlocacoesHorariosControllerFindMany } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type {
  AlocacaoHorarioResponseDto,
  AlocacoesHorariosControllerFindManyParams,
} from "@/api-generated/model"

export interface UseAlocacoesOptions {
  /** ID do período letivo para filtrar alocações */
  idPeriodoLetivo?: string
  /** ID da turma para filtrar alocações específicas */
  idTurma?: string
  /** ID do professor para filtrar alocações */
  idProfessor?: string
  /** Dia da semana para filtrar */
  diaDaSemana?: AlocacoesHorariosControllerFindManyParams["diaDaSemana"]
  /** Habilitar/desabilitar a query */
  enabled?: boolean
}

export interface UseAlocacoesReturn {
  /** Lista de alocações */
  alocacoes: AlocacaoHorarioResponseDto[]
  /** Estado de carregamento */
  isLoading: boolean
  /** Estado de erro */
  isError: boolean
  /** Objeto de erro */
  error: Error | null
  /** Função para revalidar os dados */
  refetch: () => void
  /** Indica se está fazendo refetch em background */
  isFetching: boolean
}

/**
 * Hook para buscar alocações de horário com filtros opcionais
 *
 * @param options - Opções de filtro e configuração
 * @returns Dados das alocações e estados da query
 *
 * @example
 * ```tsx
 * // Buscar todas as alocações de um período letivo
 * const { alocacoes, isLoading } = useAlocacoes({
 *   idPeriodoLetivo: '123'
 * })
 *
 * // Buscar alocações de uma turma específica
 * const { alocacoes, isLoading } = useAlocacoes({
 *   idPeriodoLetivo: '123',
 *   idTurma: '456'
 * })
 * ```
 */
export function useAlocacoes(
  options: UseAlocacoesOptions = {},
): UseAlocacoesReturn {
  const {
    idPeriodoLetivo,
    idTurma,
    idProfessor,
    diaDaSemana,
    enabled = true,
  } = options

  // Construir parâmetros de filtro
  const params: AlocacoesHorariosControllerFindManyParams = {}

  if (idPeriodoLetivo) params.idPeriodoLetivo = idPeriodoLetivo
  if (idTurma) params.idTurma = idTurma
  if (idProfessor) params.idProfessor = idProfessor
  if (diaDaSemana) params.diaDaSemana = diaDaSemana

  // Usar o hook gerado pelo Orval
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAlocacoesHorariosControllerFindMany(
    Object.keys(params).length > 0 ? params : undefined,
    {
      query: {
        enabled: enabled && (!!idPeriodoLetivo || !!idTurma || !!idProfessor),
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  )

  return {
    alocacoes: data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isFetching,
  }
}

/**
 * Hook especializado para buscar alocações de um período letivo específico
 *
 * @param idPeriodoLetivo - ID do período letivo
 * @param enabled - Se a query deve ser executada
 * @returns Dados das alocações do período
 */
export function useAlocacoesPorPeriodo(
  idPeriodoLetivo: string | undefined,
  enabled = true,
): UseAlocacoesReturn {
  return useAlocacoes({
    idPeriodoLetivo,
    enabled: enabled && !!idPeriodoLetivo,
  })
}

/**
 * Hook especializado para buscar alocações de uma turma específica
 *
 * @param idTurma - ID da turma
 * @param enabled - Se a query deve ser executada
 * @returns Dados das alocações da turma
 */
export function useAlocacoesPorTurma(
  idTurma: string | undefined,
  enabled = true,
): UseAlocacoesReturn {
  return useAlocacoes({
    idTurma,
    enabled: enabled && !!idTurma,
  })
}

/**
 * Hook especializado para buscar alocações de um professor específico
 *
 * @param idProfessor - ID do professor
 * @param enabled - Se a query deve ser executada
 * @returns Dados das alocações do professor
 */
export function useAlocacoesPorProfessor(
  idProfessor: string | undefined,
  enabled = true,
): UseAlocacoesReturn {
  return useAlocacoes({
    idProfessor,
    enabled: enabled && !!idProfessor,
  })
}
