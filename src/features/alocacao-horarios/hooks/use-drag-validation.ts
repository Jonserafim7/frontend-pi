import { useMemo } from "react"
import { useDisponibilidadeProfessorControllerFindByProfessor } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { mapDiaSemanaToApi, type TurmaDisplay } from "../types"
import { useDndAlocacao } from "../components/dnd-provider"
import { Ban, Clock, Users, AlertTriangle } from "lucide-react"

interface SlotValidation {
  isValid: boolean
  isBlocked: boolean
  reason?: string
  blockType: "none" | "occupied" | "unavailable" | "conflict"
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
 * Hook para bloquear slots indisponíveis durante drag
 */
export function useDragValidation(draggedTurma: TurmaDisplay | null) {
  const { alocacoes } = useDndAlocacao()

  // Buscar disponibilidades do professor da turma sendo arrastada
  const { data: disponibilidades = [] } =
    useDisponibilidadeProfessorControllerFindByProfessor(
      draggedTurma?.professorId || "",
      {},
    )

  // Função para validar se um slot deve ser bloqueado
  const validateSlot = useMemo(() => {
    return (slotId: string): SlotValidation => {
      if (!draggedTurma) {
        return {
          isValid: true,
          isBlocked: false,
          blockType: "none",
        }
      }

      // Parse slot ID (formato: "DIA-HORA-TURNO")
      const [dia, hora, turno] = slotId.split("-")

      // 1. Verificar se slot já está ocupado por OUTRA turma
      const existingAlocacao = alocacoes.find(
        (a) =>
          a.diaDaSemana === dia &&
          a.horaInicio === hora &&
          a.turno === turno &&
          a.turmaId !== draggedTurma.id, // Permitir reposicionamento da mesma turma
      )

      if (existingAlocacao) {
        return {
          isValid: false,
          isBlocked: true,
          reason: `Slot ocupado por ${existingAlocacao.turma.codigo}`,
          blockType: "occupied",
        }
      }

      // 2. Verificar disponibilidade do professor no horário
      const diaDaSemanaApi = mapDiaSemanaToApi(dia)
      const disponibilidade = disponibilidades.find(
        (d) =>
          d.diaDaSemana === diaDaSemanaApi &&
          d.horaInicio <= hora &&
          d.horaFim > hora,
      )

      // Se não há disponibilidade cadastrada = indisponível
      if (!disponibilidade) {
        return {
          isValid: false,
          isBlocked: true,
          reason: `Prof. ${draggedTurma.professor} não tem disponibilidade neste horário`,
          blockType: "unavailable",
        }
      }

      // Se disponibilidade marcada como INDISPONIVEL
      if (disponibilidade.status === "INDISPONIVEL") {
        return {
          isValid: false,
          isBlocked: true,
          reason: `Prof. ${draggedTurma.professor} marcou como indisponível`,
          blockType: "unavailable",
        }
      }

      // 3. Verificar conflitos - professor já alocado em outra turma no mesmo horário
      const professorConflict = alocacoes.find(
        (a) =>
          a.diaDaSemana === dia &&
          a.horaInicio === hora &&
          a.turma.professorId === draggedTurma.professorId &&
          a.turmaId !== draggedTurma.id,
      )

      if (professorConflict) {
        return {
          isValid: false,
          isBlocked: true,
          reason: `Prof. ${draggedTurma.professor} já leciona ${professorConflict.turma.codigo} neste horário`,
          blockType: "conflict",
        }
      }

      // Slot válido - não bloquear
      return {
        isValid: true,
        isBlocked: false,
        blockType: "none",
      }
    }
  }, [draggedTurma, alocacoes, disponibilidades])

  // Função para obter estilos de bloqueio
  const getBlockedSlotStyles = (slotId: string): string => {
    if (!draggedTurma) return ""

    const validation = validateSlot(slotId)

    if (!validation.isBlocked) return ""

    const baseBlockedClasses =
      "relative opacity-60 cursor-not-allowed pointer-events-none"

    switch (validation.blockType) {
      case "occupied":
        return `${baseBlockedClasses} bg-red-50 border-red-200 ring-2 ring-red-100`
      case "unavailable":
        return `${baseBlockedClasses} bg-slate-50 border-slate-200 ring-2 ring-slate-100`
      case "conflict":
        return `${baseBlockedClasses} bg-amber-50 border-amber-200 ring-2 ring-amber-100`
      default:
        return baseBlockedClasses
    }
  }

  // Função para verificar se o drop deve ser permitido
  const canDrop = (slotId: string): boolean => {
    if (!draggedTurma) return false
    return validateSlot(slotId).isValid
  }

  // Obter overlay de bloqueio para renderizar sobre slots
  const getBlockOverlay = (slotId: string): BlockOverlay | null => {
    if (!draggedTurma) return null

    const validation = validateSlot(slotId)

    if (!validation.isBlocked) return null

    switch (validation.blockType) {
      case "occupied":
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
      case "conflict":
        return {
          icon: AlertTriangle,
          reason: validation.reason || "",
          type: validation.blockType,
          iconClassName: "text-amber-600",
          bgClassName: "bg-amber-500/90",
          borderClassName: "border-amber-300",
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

  return {
    validateSlot,
    getBlockedSlotStyles,
    getBlockOverlay,
    canDrop,
    isDragActive: !!draggedTurma,
    blockedSlotsCount: draggedTurma ? Object.keys({}).length : 0, // Será calculado quando necessário
  }
}
