import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import { doAllocationsOverlap, findAllocationConflicts } from "./gridPositioning"

/**
 * Tipos de conflito possíveis
 */
export enum ConflictType {
  /** Mesmo professor em horários sobrepostos */
  PROFESSOR_OVERLAP = "PROFESSOR_OVERLAP",
  /** Mesma turma em horários sobrepostos */
  TURMA_OVERLAP = "TURMA_OVERLAP",
  /** Mesmo slot de horário ocupado por múltiplas alocações */
  SLOT_OVERLAP = "SLOT_OVERLAP",
  /** Disciplina com carga horária excedida */
  CARGA_HORARIA_EXCEEDED = "CARGA_HORARIA_EXCEEDED",
}

/**
 * Severidade do conflito
 */
export enum ConflictSeverity {
  /** Conflito crítico que impede funcionamento */
  CRITICAL = "CRITICAL",
  /** Conflito importante que deve ser resolvido */
  HIGH = "HIGH",
  /** Conflito moderado, recomenda-se resolução */
  MEDIUM = "MEDIUM",
  /** Conflito menor, pode ser tolerado */
  LOW = "LOW",
}

/**
 * Detalhes de um conflito detectado
 */
export interface ConflictDetails {
  /** ID único do conflito */
  id: string
  /** Tipo do conflito */
  type: ConflictType
  /** Severidade do conflito */
  severity: ConflictSeverity
  /** Alocações envolvidas no conflito */
  alocacoes: AlocacaoHorarioResponseDto[]
  /** Descrição do conflito */
  description: string
  /** Sugestões de resolução */
  suggestions: string[]
  /** Se o conflito pode ser resolvido automaticamente */
  canAutoResolve: boolean
}

/**
 * Estratégias de resolução de conflitos
 */
export enum ResolutionStrategy {
  /** Manter a primeira alocação, remover as outras */
  KEEP_FIRST = "KEEP_FIRST",
  /** Manter a última alocação, remover as outras */
  KEEP_LAST = "KEEP_LAST",
  /** Manter a alocação com maior prioridade */
  KEEP_PRIORITY = "KEEP_PRIORITY",
  /** Mover alocações para slots livres */
  MOVE_TO_FREE_SLOTS = "MOVE_TO_FREE_SLOTS",
  /** Resolução manual pelo usuário */
  MANUAL_RESOLUTION = "MANUAL_RESOLUTION",
}

/**
 * Detecta conflitos de professor (mesmo professor em horários sobrepostos)
 */
export function detectProfessorConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
): ConflictDetails[] {
  const conflicts: ConflictDetails[] = []
  const professorGroups = new Map<string, AlocacaoHorarioResponseDto[]>()

  // Agrupar alocações por professor
  alocacoes.forEach((alocacao) => {
    const professorId = alocacao.turma.professorAlocado?.id
    if (professorId) {
      const existing = professorGroups.get(professorId) || []
      professorGroups.set(professorId, [...existing, alocacao])
    }
  })

  // Verificar conflitos dentro de cada grupo de professor
  professorGroups.forEach((professorAlocacoes, professorId) => {
    if (professorAlocacoes.length > 1) {
      for (let i = 0; i < professorAlocacoes.length; i++) {
        for (let j = i + 1; j < professorAlocacoes.length; j++) {
          if (
            doAllocationsOverlap(professorAlocacoes[i], professorAlocacoes[j])
          ) {
            const professorNome =
              professorAlocacoes[i].turma.professorAlocado?.nome || "Professor"

            conflicts.push({
              id: `professor-${professorId}-${i}-${j}`,
              type: ConflictType.PROFESSOR_OVERLAP,
              severity: ConflictSeverity.CRITICAL,
              alocacoes: [professorAlocacoes[i], professorAlocacoes[j]],
              description: `${professorNome} está alocado em horários sobrepostos`,
              suggestions: [
                "Mover uma das alocações para outro horário",
                "Atribuir outro professor para uma das turmas",
                "Verificar se os horários estão corretos",
              ],
              canAutoResolve: false,
            })
          }
        }
      }
    }
  })

  return conflicts
}

/**
 * Detecta conflitos de turma (mesma turma em horários sobrepostos)
 */
export function detectTurmaConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
): ConflictDetails[] {
  const conflicts: ConflictDetails[] = []
  const turmaGroups = new Map<string, AlocacaoHorarioResponseDto[]>()

  // Agrupar alocações por turma
  alocacoes.forEach((alocacao) => {
    const turmaId = alocacao.turma.id
    const existing = turmaGroups.get(turmaId) || []
    turmaGroups.set(turmaId, [...existing, alocacao])
  })

  // Verificar conflitos dentro de cada grupo de turma
  turmaGroups.forEach((turmaAlocacoes, turmaId) => {
    if (turmaAlocacoes.length > 1) {
      for (let i = 0; i < turmaAlocacoes.length; i++) {
        for (let j = i + 1; j < turmaAlocacoes.length; j++) {
          if (doAllocationsOverlap(turmaAlocacoes[i], turmaAlocacoes[j])) {
            const turmaCodigo = turmaAlocacoes[i].turma.codigoDaTurma

            conflicts.push({
              id: `turma-${turmaId}-${i}-${j}`,
              type: ConflictType.TURMA_OVERLAP,
              severity: ConflictSeverity.CRITICAL,
              alocacoes: [turmaAlocacoes[i], turmaAlocacoes[j]],
              description: `Turma ${turmaCodigo} está alocada em horários sobrepostos`,
              suggestions: [
                "Mover uma das alocações para outro horário",
                "Verificar se a turma precisa de múltiplas alocações",
                "Confirmar se os horários estão corretos",
              ],
              canAutoResolve: false,
            })
          }
        }
      }
    }
  })

  return conflicts
}

/**
 * Detecta conflitos de slot (múltiplas alocações no mesmo slot)
 */
export function detectSlotConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
): ConflictDetails[] {
  const conflicts: ConflictDetails[] = []
  const slotGroups = new Map<string, AlocacaoHorarioResponseDto[]>()

  // Agrupar alocações por slot (dia + horário)
  alocacoes.forEach((alocacao) => {
    const slotKey = `${alocacao.diaDaSemana}-${alocacao.horaInicio}-${alocacao.horaFim}`
    const existing = slotGroups.get(slotKey) || []
    slotGroups.set(slotKey, [...existing, alocacao])
  })

  // Verificar slots com múltiplas alocações
  slotGroups.forEach((slotAlocacoes, slotKey) => {
    if (slotAlocacoes.length > 1) {
      const [dia, horaInicio, horaFim] = slotKey.split("-")

      conflicts.push({
        id: `slot-${slotKey}`,
        type: ConflictType.SLOT_OVERLAP,
        severity: ConflictSeverity.HIGH,
        alocacoes: slotAlocacoes,
        description: `Múltiplas alocações no mesmo slot: ${dia} ${horaInicio}-${horaFim}`,
        suggestions: [
          "Mover algumas alocações para outros horários",
          "Verificar se todas as alocações são necessárias",
          "Considerar dividir o slot em sub-períodos",
        ],
        canAutoResolve: true,
      })
    }
  })

  return conflicts
}

/**
 * Detecta todos os tipos de conflitos
 */
export function detectAllConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
): ConflictDetails[] {
  const allConflicts: ConflictDetails[] = []

  // Detectar diferentes tipos de conflitos
  allConflicts.push(...detectProfessorConflicts(alocacoes))
  allConflicts.push(...detectTurmaConflicts(alocacoes))
  allConflicts.push(...detectSlotConflicts(alocacoes))

  // Ordenar por severidade
  return allConflicts.sort((a, b) => {
    const severityOrder = {
      [ConflictSeverity.CRITICAL]: 0,
      [ConflictSeverity.HIGH]: 1,
      [ConflictSeverity.MEDIUM]: 2,
      [ConflictSeverity.LOW]: 3,
    }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

/**
 * Filtra conflitos por severidade
 */
export function filterConflictsBySeverity(
  conflicts: ConflictDetails[],
  severities: ConflictSeverity[],
): ConflictDetails[] {
  return conflicts.filter((conflict) => severities.includes(conflict.severity))
}

/**
 * Filtra conflitos por tipo
 */
export function filterConflictsByType(
  conflicts: ConflictDetails[],
  types: ConflictType[],
): ConflictDetails[] {
  return conflicts.filter((conflict) => types.includes(conflict.type))
}

/**
 * Encontra conflitos que envolvem uma alocação específica
 */
export function findConflictsForAllocation(
  conflicts: ConflictDetails[],
  alocacaoId: string,
): ConflictDetails[] {
  return conflicts.filter((conflict) =>
    conflict.alocacoes.some((alocacao) => alocacao.id === alocacaoId),
  )
}

/**
 * Calcula estatísticas de conflitos
 */
export function calculateConflictStats(conflicts: ConflictDetails[]) {
  const stats = {
    total: conflicts.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    autoResolvable: 0,
    byType: {
      [ConflictType.PROFESSOR_OVERLAP]: 0,
      [ConflictType.TURMA_OVERLAP]: 0,
      [ConflictType.SLOT_OVERLAP]: 0,
      [ConflictType.CARGA_HORARIA_EXCEEDED]: 0,
    },
  }

  conflicts.forEach((conflict) => {
    // Contar por severidade
    switch (conflict.severity) {
      case ConflictSeverity.CRITICAL:
        stats.critical++
        break
      case ConflictSeverity.HIGH:
        stats.high++
        break
      case ConflictSeverity.MEDIUM:
        stats.medium++
        break
      case ConflictSeverity.LOW:
        stats.low++
        break
    }

    // Contar auto-resolvíveis
    if (conflict.canAutoResolve) {
      stats.autoResolvable++
    }

    // Contar por tipo
    stats.byType[conflict.type]++
  })

  return stats
}

/**
 * Sugere estratégias de resolução para um conflito
 */
export function suggestResolutionStrategies(
  conflict: ConflictDetails,
): ResolutionStrategy[] {
  const strategies: ResolutionStrategy[] = []

  switch (conflict.type) {
    case ConflictType.SLOT_OVERLAP:
      strategies.push(
        ResolutionStrategy.MOVE_TO_FREE_SLOTS,
        ResolutionStrategy.KEEP_PRIORITY,
        ResolutionStrategy.MANUAL_RESOLUTION,
      )
      break

    case ConflictType.PROFESSOR_OVERLAP:
    case ConflictType.TURMA_OVERLAP:
      strategies.push(
        ResolutionStrategy.MOVE_TO_FREE_SLOTS,
        ResolutionStrategy.MANUAL_RESOLUTION,
      )
      break

    default:
      strategies.push(ResolutionStrategy.MANUAL_RESOLUTION)
  }

  return strategies
}

/**
 * Valida se uma resolução é possível
 */
export function validateResolution(
  conflict: ConflictDetails,
  strategy: ResolutionStrategy,
  allAlocacoes: AlocacaoHorarioResponseDto[],
): { valid: boolean; reason?: string } {
  switch (strategy) {
    case ResolutionStrategy.MOVE_TO_FREE_SLOTS:
      // Verificar se existem slots livres suficientes
      // Esta lógica seria implementada com base na configuração de horário
      return { valid: true }

    case ResolutionStrategy.KEEP_FIRST:
    case ResolutionStrategy.KEEP_LAST:
    case ResolutionStrategy.KEEP_PRIORITY:
      return { valid: true }

    case ResolutionStrategy.MANUAL_RESOLUTION:
      return { valid: true }

    default:
      return { valid: false, reason: "Estratégia não reconhecida" }
  }
}
