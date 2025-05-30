import { useMemo, useCallback } from "react"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import {
  detectAllConflicts,
  filterConflictsBySeverity,
  filterConflictsByType,
  findConflictsForAllocation,
  calculateConflictStats,
  suggestResolutionStrategies,
  validateResolution,
  ConflictSeverity,
  type ConflictDetails,
  type ConflictType,
  type ResolutionStrategy,
} from "../utils/conflictHandling"

export interface UseConflictsOptions {
  /** Lista de alocações para analisar */
  alocacoes: AlocacaoHorarioResponseDto[]
  /** Se deve detectar conflitos automaticamente */
  enabled?: boolean
  /** Severidades a serem consideradas */
  severityFilter?: ConflictSeverity[]
  /** Tipos de conflito a serem considerados */
  typeFilter?: ConflictType[]
}

export interface UseConflictsReturn {
  /** Todos os conflitos detectados */
  conflicts: ConflictDetails[]
  /** Conflitos filtrados */
  filteredConflicts: ConflictDetails[]
  /** Estatísticas dos conflitos */
  stats: ReturnType<typeof calculateConflictStats>
  /** Se há conflitos críticos */
  hasCriticalConflicts: boolean
  /** Se há conflitos que podem ser auto-resolvidos */
  hasAutoResolvableConflicts: boolean
  /** Função para encontrar conflitos de uma alocação específica */
  getConflictsForAllocation: (alocacaoId: string) => ConflictDetails[]
  /** Função para sugerir estratégias de resolução */
  getSuggestedStrategies: (conflict: ConflictDetails) => ResolutionStrategy[]
  /** Função para validar uma estratégia de resolução */
  validateStrategy: (
    conflict: ConflictDetails,
    strategy: ResolutionStrategy,
  ) => { valid: boolean; reason?: string }
  /** Função para filtrar conflitos por severidade */
  filterBySeverity: (severities: ConflictSeverity[]) => ConflictDetails[]
  /** Função para filtrar conflitos por tipo */
  filterByType: (types: ConflictType[]) => ConflictDetails[]
}

/**
 * Hook para gerenciar detecção e resolução de conflitos de alocações
 */
export function useConflicts({
  alocacoes,
  enabled = true,
  severityFilter,
  typeFilter,
}: UseConflictsOptions): UseConflictsReturn {
  // Detectar todos os conflitos
  const conflicts = useMemo(() => {
    if (!enabled || !alocacoes.length) {
      return []
    }
    return detectAllConflicts(alocacoes)
  }, [alocacoes, enabled])

  // Aplicar filtros
  const filteredConflicts = useMemo(() => {
    let filtered = conflicts

    if (severityFilter && severityFilter.length > 0) {
      filtered = filterConflictsBySeverity(filtered, severityFilter)
    }

    if (typeFilter && typeFilter.length > 0) {
      filtered = filterConflictsByType(filtered, typeFilter)
    }

    return filtered
  }, [conflicts, severityFilter, typeFilter])

  // Calcular estatísticas
  const stats = useMemo(() => {
    return calculateConflictStats(conflicts)
  }, [conflicts])

  // Verificar se há conflitos críticos
  const hasCriticalConflicts = useMemo(() => {
    return conflicts.some(
      (conflict) => conflict.severity === ConflictSeverity.CRITICAL,
    )
  }, [conflicts])

  // Verificar se há conflitos auto-resolvíveis
  const hasAutoResolvableConflicts = useMemo(() => {
    return conflicts.some((conflict) => conflict.canAutoResolve)
  }, [conflicts])

  // Função para encontrar conflitos de uma alocação específica
  const getConflictsForAllocation = useCallback(
    (alocacaoId: string) => {
      return findConflictsForAllocation(conflicts, alocacaoId)
    },
    [conflicts],
  )

  // Função para sugerir estratégias de resolução
  const getSuggestedStrategies = useCallback((conflict: ConflictDetails) => {
    return suggestResolutionStrategies(conflict)
  }, [])

  // Função para validar uma estratégia de resolução
  const validateStrategy = useCallback(
    (conflict: ConflictDetails, strategy: ResolutionStrategy) => {
      return validateResolution(conflict, strategy, alocacoes)
    },
    [alocacoes],
  )

  // Função para filtrar por severidade
  const filterBySeverity = useCallback(
    (severities: ConflictSeverity[]) => {
      return filterConflictsBySeverity(conflicts, severities)
    },
    [conflicts],
  )

  // Função para filtrar por tipo
  const filterByType = useCallback(
    (types: ConflictType[]) => {
      return filterConflictsByType(conflicts, types)
    },
    [conflicts],
  )

  return {
    conflicts,
    filteredConflicts,
    stats,
    hasCriticalConflicts,
    hasAutoResolvableConflicts,
    getConflictsForAllocation,
    getSuggestedStrategies,
    validateStrategy,
    filterBySeverity,
    filterByType,
  }
}

/**
 * Hook especializado para conflitos críticos
 */
export function useCriticalConflicts(alocacoes: AlocacaoHorarioResponseDto[]) {
  return useConflicts({
    alocacoes,
    severityFilter: [ConflictSeverity.CRITICAL],
  })
}

/**
 * Hook especializado para conflitos auto-resolvíveis
 */
export function useAutoResolvableConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
) {
  const { conflicts, ...rest } = useConflicts({ alocacoes })

  const autoResolvableConflicts = useMemo(() => {
    return conflicts.filter((conflict) => conflict.canAutoResolve)
  }, [conflicts])

  return {
    conflicts: autoResolvableConflicts,
    ...rest,
  }
}

/**
 * Hook para conflitos de uma alocação específica
 */
export function useAllocationConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
  alocacaoId: string,
) {
  const {
    conflicts,
    getConflictsForAllocation,
    hasCriticalConflicts: _,
    ...rest
  } = useConflicts({ alocacoes })

  const allocationConflicts = useMemo(() => {
    return getConflictsForAllocation(alocacaoId)
  }, [getConflictsForAllocation, alocacaoId])

  const hasConflicts = allocationConflicts.length > 0
  const hasAllocationCriticalConflicts = allocationConflicts.some(
    (c) => c.severity === ConflictSeverity.CRITICAL,
  )

  return {
    conflicts: allocationConflicts,
    hasConflicts,
    hasCriticalConflicts: hasAllocationCriticalConflicts,
    ...rest,
  }
}
