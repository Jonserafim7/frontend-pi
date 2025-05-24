import type { Event as CalendarEvent } from "react-big-calendar"
import { diasSemanaMap, type DiaSemana } from "@/lib/calendar-config"

// Tipos para os eventos do calendário
export interface DisponibilidadeEvent extends CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    id: string
    diaDaSemana: string
    horaInicio: string
    horaFim: string
    status: string
    professorId: string
    periodoId: string
  }
  className?: string
}

// Informações de seleção de slot
export interface SlotInfo {
  start: Date
  end: Date
  slots: Date[]
  action: "select" | "click" | "doubleClick"
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean
  message?: string
  suggestedSlots?: Array<{
    diaDaSemana: string
    horaInicio: string
    horaFim: string
  }>
}

/**
 * Converte disponibilidades da API para eventos do calendário
 */
export const transformDisponibilidadesToEvents = (
  disponibilidades: any[],
): DisponibilidadeEvent[] => {
  if (!disponibilidades?.length) return []

  return disponibilidades.map((disp) => ({
    id: disp.id,
    title: `${disp.horaInicio} - ${disp.horaFim}`,
    start: createDateFromDiaHora(disp.diaDaSemana, disp.horaInicio),
    end: createDateFromDiaHora(disp.diaDaSemana, disp.horaFim),
    resource: disp,
    className: `disponibilidade-${disp.status.toLowerCase()}`,
  }))
}

/**
 * Cria uma data a partir do dia da semana e hora
 */
export const createDateFromDiaHora = (
  diaDaSemana: string,
  hora: string,
): Date => {
  const today = new Date()
  const currentDay = today.getDay()
  const targetDay = diasSemanaMap[diaDaSemana as DiaSemana]

  // Calcular diferença de dias
  let dayDiff = targetDay - currentDay
  if (dayDiff < 0) {
    dayDiff += 7
  }

  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + dayDiff)

  // Parsear hora (formato "HH:mm")
  const [hours, minutes] = hora.split(":").map(Number)
  targetDate.setHours(hours, minutes, 0, 0)

  return targetDate
}

/**
 * Converte seleção do calendário para dados do formulário
 */
export const transformSlotToFormData = (slotInfo: SlotInfo) => {
  const diaDaSemana = getDiaSemanaFromDate(slotInfo.start)
  const horaInicio = formatTimeFromDate(slotInfo.start)
  const horaFim = formatTimeFromDate(slotInfo.end)

  return {
    diaDaSemana,
    horaInicio,
    horaFim,
  }
}

/**
 * Obtém o dia da semana a partir de uma data
 */
export const getDiaSemanaFromDate = (date: Date): string => {
  const dayNumber = date.getDay()
  const entry = Object.entries(diasSemanaMap).find(
    ([_, value]) => value === dayNumber,
  )
  return entry ? entry[0] : "SEGUNDA"
}

/**
 * Formata time de Date para string "HH:mm"
 */
export const formatTimeFromDate = (date: Date): string => {
  return date.toTimeString().slice(0, 5)
}

/**
 * Valida se uma seleção está dentro dos slots válidos
 */
export const validateSlotSelection = (
  slotInfo: SlotInfo,
  slotsValidos?: any,
): ValidationResult => {
  if (!slotsValidos) {
    return {
      isValid: false,
      message: "Configurações de horário não encontradas",
    }
  }

  const { diaDaSemana, horaInicio, horaFim } = transformSlotToFormData(slotInfo)

  // Buscar slots válidos para o dia selecionado
  const slotsParaDia = slotsValidos[diaDaSemana] || []

  if (slotsParaDia.length === 0) {
    return {
      isValid: false,
      message: `Não há horários configurados para ${diaDaSemana.toLowerCase()}`,
    }
  }

  // Verificar se o horário selecionado está dentro de algum slot válido
  const isValidSlot = slotsParaDia.some((slot: any) => {
    return horaInicio >= slot.horaInicio && horaFim <= slot.horaFim
  })

  if (!isValidSlot) {
    return {
      isValid: false,
      message: `Horário deve estar dentro dos slots configurados: ${slotsParaDia.map((s: any) => `${s.horaInicio}-${s.horaFim}`).join(", ")}`,
      suggestedSlots: slotsParaDia,
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Formata informações do slot para exibição
 */
export const formatSlotInfo = (slotInfo: SlotInfo): string => {
  const { diaDaSemana, horaInicio, horaFim } = transformSlotToFormData(slotInfo)
  const diaFormatado = diaDaSemana.charAt(0) + diaDaSemana.slice(1).toLowerCase()
  return `${diaFormatado}, ${horaInicio} - ${horaFim}`
}
