import { useMemo, useRef } from "react"
import { useDisponibilidadeProfessorControllerFindByProfessor } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import {
  mapDiaSemanaToApi,
  type TurmaDisplay,
  createSlotData,
  canAddTurmaToSlot,
} from "../types"
import { useDndAlocacao } from "../components/dnd-provider"
import { Ban, Clock, Users, AlertTriangle } from "lucide-react"

interface SlotValidation {
  isValid: boolean
  isBlocked: boolean
  reason?: string
  blockType:
    | "none"
    | "occupied"
    | "unavailable"
    | "conflict"
    | "capacity-exceeded"
    | "duplicate"
}

interface BlockOverlay {
  icon: React.ComponentType<{ className?: string }>
  reason: string
  type: string
  iconClassName: string
  bgClassName: string
  borderClassName: string
}

/**
 * Hook otimizado para validar disponibilidade e múltiplas turmas durante drag
 */
export function useDragValidation(draggedTurma: TurmaDisplay | null) {
  const { alocacoes } = useDndAlocacao()

  // Cache para evitar recalcular validações repetidas
  const validationCacheRef = useRef<Map<string, SlotValidation>>(new Map())

  // Buscar disponibilidades do professor da turma sendo arrastada (apenas quando necessário)
  const { data: disponibilidades = [] } =
    useDisponibilidadeProfessorControllerFindByProfessor(
      draggedTurma?.professorId || "",
      {},
    )

  // Memoizar criação de slots para evitar recalcular
  const slotDataCache = useMemo(() => {
    const cache = new Map<string, any>()
    return {
      getSlotData: (slotId: string, maxCapacity: number = 3) => {
        const cacheKey = `${slotId}-${maxCapacity}-${alocacoes.length}`
        if (!cache.has(cacheKey)) {
          cache.set(cacheKey, createSlotData(slotId, alocacoes, maxCapacity))
        }
        return cache.get(cacheKey)
      },
    }
  }, [alocacoes])

  // Função para validar se um slot deve ser bloqueado (memoizada)
  const validateSlot = useMemo(() => {
    return (slotId: string, maxCapacity: number = 3): SlotValidation => {
      if (!draggedTurma) {
        return {
          isValid: true,
          isBlocked: false,
          blockType: "none",
        }
      }

      // Verificar cache primeiro
      const cacheKey = `${slotId}-${draggedTurma.id}-${maxCapacity}`
      if (validationCacheRef.current.has(cacheKey)) {
        return validationCacheRef.current.get(cacheKey)!
      }

      // Parse slot ID (formato: "DIA-HORA-TURNO")
      const [dia, hora, turno] = slotId.split("-")

      // Usar cache do slot
      const slotData = slotDataCache.getSlotData(slotId, maxCapacity)

      // 1. Verificar se a turma pode ser adicionada ao slot (múltiplas turmas)
      const canAddResult = canAddTurmaToSlot(slotData, draggedTurma)

      if (!canAddResult.canAdd) {
        // Determinar tipo específico do bloqueio
        let blockType: SlotValidation["blockType"] = "conflict"

        if (canAddResult.reason?.includes("capacidade máxima")) {
          blockType = "capacity-exceeded"
        } else if (canAddResult.reason?.includes("já está alocada")) {
          blockType = "duplicate"
        } else if (canAddResult.reason?.includes("já tem aula")) {
          blockType = "conflict"
        }

        const result = {
          isValid: false,
          isBlocked: true,
          reason: canAddResult.reason,
          blockType,
        }

        validationCacheRef.current.set(cacheKey, result)
        return result
      }

      // 2. Verificar disponibilidade do professor no horário (apenas se tem disponibilidades)
      if (disponibilidades.length > 0) {
        const diaDaSemanaApi = mapDiaSemanaToApi(dia)
        const disponibilidade = disponibilidades.find(
          (d) =>
            d.diaDaSemana === diaDaSemanaApi &&
            d.horaInicio <= hora &&
            d.horaFim > hora,
        )

        // Se não há disponibilidade cadastrada = indisponível
        if (!disponibilidade) {
          const result = {
            isValid: false,
            isBlocked: true,
            reason: `Prof. ${draggedTurma.professor} não tem disponibilidade neste horário`,
            blockType: "unavailable" as const,
          }
          validationCacheRef.current.set(cacheKey, result)
          return result
        }

        // Se disponibilidade marcada como INDISPONIVEL
        if (disponibilidade.status === "INDISPONIVEL") {
          const result = {
            isValid: false,
            isBlocked: true,
            reason: `Prof. ${draggedTurma.professor} marcou como indisponível`,
            blockType: "unavailable" as const,
          }
          validationCacheRef.current.set(cacheKey, result)
          return result
        }
      }

      // 3. Verificar conflitos globais - professor já alocado em outro slot no mesmo horário
      const professorConflictGlobal = alocacoes.find(
        (a) =>
          a.diaDaSemana === dia &&
          a.horaInicio === hora &&
          a.turma.professorId === draggedTurma.professorId &&
          a.turmaId !== draggedTurma.id &&
          `${a.diaDaSemana}-${a.horaInicio}-${a.turno}` !== slotId, // Conflito em outro slot
      )

      if (professorConflictGlobal) {
        const result = {
          isValid: false,
          isBlocked: true,
          reason: `Prof. ${draggedTurma.professor} já leciona ${professorConflictGlobal.turma.codigo} em outro local neste horário`,
          blockType: "conflict" as const,
        }
        validationCacheRef.current.set(cacheKey, result)
        return result
      }

      // Slot válido - não bloquear
      const result = {
        isValid: true,
        isBlocked: false,
        blockType: "none" as const,
      }

      validationCacheRef.current.set(cacheKey, result)
      return result
    }
  }, [draggedTurma, alocacoes, disponibilidades, slotDataCache])

  // Limpar cache quando turma muda
  useMemo(() => {
    validationCacheRef.current.clear()
  }, [draggedTurma?.id])

  // Função para obter estilos de bloqueio (memoizada)
  const getBlockedSlotStyles = useMemo(() => {
    return (slotId: string, maxCapacity?: number): string => {
      if (!draggedTurma) return ""

      const validation = validateSlot(slotId, maxCapacity)

      if (!validation.isBlocked) return ""

      const baseBlockedClasses =
        "relative opacity-60 cursor-not-allowed pointer-events-none"

      switch (validation.blockType) {
        case "occupied":
        case "conflict":
          return `${baseBlockedClasses} bg-red-50 border-red-200 ring-2 ring-red-100`
        case "unavailable":
          return `${baseBlockedClasses} bg-slate-50 border-slate-200 ring-2 ring-slate-100`
        case "capacity-exceeded":
          return `${baseBlockedClasses} bg-orange-50 border-orange-200 ring-2 ring-orange-100`
        case "duplicate":
          return `${baseBlockedClasses} bg-purple-50 border-purple-200 ring-2 ring-purple-100`
        default:
          return baseBlockedClasses
      }
    }
  }, [draggedTurma, validateSlot])

  // Função para verificar se o drop deve ser permitido (memoizada)
  const canDrop = useMemo(() => {
    return (slotId: string, maxCapacity?: number): boolean => {
      if (!draggedTurma) return false
      return validateSlot(slotId, maxCapacity).isValid
    }
  }, [draggedTurma, validateSlot])

  // Obter overlay de bloqueio para renderizar sobre slots (memoizada)
  const getBlockOverlay = useMemo(() => {
    return (slotId: string, maxCapacity?: number): BlockOverlay | null => {
      if (!draggedTurma) return null

      const validation = validateSlot(slotId, maxCapacity)

      if (!validation.isBlocked) return null

      switch (validation.blockType) {
        case "occupied":
        case "conflict":
          return {
            icon: Users,
            reason: validation.reason || "",
            type: validation.blockType,
            iconClassName: "text-red-600",
            bgClassName: "bg-red-500/90",
            borderClassName: "border-red-300",
          }
        case "unavailable":
          return {
            icon: Clock,
            reason: validation.reason || "",
            type: validation.blockType,
            iconClassName: "text-slate-600",
            bgClassName: "bg-slate-500/90",
            borderClassName: "border-slate-300",
          }
        case "capacity-exceeded":
          return {
            icon: AlertTriangle,
            reason: validation.reason || "",
            type: validation.blockType,
            iconClassName: "text-orange-600",
            bgClassName: "bg-orange-500/90",
            borderClassName: "border-orange-300",
          }
        case "duplicate":
          return {
            icon: Ban,
            reason: validation.reason || "",
            type: validation.blockType,
            iconClassName: "text-purple-600",
            bgClassName: "bg-purple-500/90",
            borderClassName: "border-purple-300",
          }
        default:
          return {
            icon: Ban,
            reason: validation.reason || "",
            type: validation.blockType,
            iconClassName: "text-gray-600",
            bgClassName: "bg-gray-500/90",
            borderClassName: "border-gray-300",
          }
      }
    }
  }, [draggedTurma, validateSlot])

  // Função para validar múltiplas turmas em um slot específico (memoizada)
  const validateMultipleSlot = useMemo(() => {
    return (slotId: string, maxCapacity: number = 3) => {
      const slotData = slotDataCache.getSlotData(slotId, maxCapacity)

      return {
        currentCount: slotData.alocacoes.length,
        maxCapacity,
        canAcceptMore: slotData.canAcceptMultiple,
        hasConflicts: slotData.conflictInfo?.hasConflict || false,
        conflictingProfessors:
          slotData.conflictInfo?.professoresConflitantes || [],
        alocacoes: slotData.alocacoes,
      }
    }
  }, [slotDataCache])

  return {
    validateSlot,
    getBlockedSlotStyles,
    getBlockOverlay,
    canDrop,
    validateMultipleSlot,
    isDragActive: !!draggedTurma,
    disponibilidades,
  }
}
