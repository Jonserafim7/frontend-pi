import { momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/pt-br"

// Configurar momento para português brasileiro
moment.locale("pt-br")
export const localizer = momentLocalizer(moment)

// Mensagens customizadas em português
export const calendarMessages = {
  today: "Hoje",
  previous: "Anterior",
  next: "Próximo",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Disponibilidade",
  noEventsInRange: "Nenhuma disponibilidade neste período",
  showMore: (total: number) => `+ Ver mais (${total})`,
  allDay: "Dia inteiro",
  work_week: "Semana útil",
}

// Configurações padrão do calendário
export const calendarDefaults = {
  defaultView: "week" as const,
  views: ["week", "day"] as const,
  step: 50, // 50 minutos por slot (baseado na configuração de aulas)
  timeslots: 1,
  min: new Date(0, 0, 0, 7, 0), // 07:00 - início do dia
  max: new Date(0, 0, 0, 22, 0), // 22:00 - fim do dia
  scrollToTime: new Date(0, 0, 0, 8, 0), // Auto-scroll para 08:00
}

// Mapeamento de dias da semana
export const diasSemanaMap = {
  SEGUNDA: 1, // Monday
  TERCA: 2, // Tuesday
  QUARTA: 3, // Wednesday
  QUINTA: 4, // Thursday
  SEXTA: 5, // Friday
  SABADO: 6, // Saturday
  DOMINGO: 0, // Sunday
} as const

export type DiaSemana = keyof typeof diasSemanaMap
