/**
 * Constantes e utilitários para validações de configuração de horários
 *
 * Este módulo define as regras de negócio para configuração de horários acadêmicos:
 * - Duração máxima por período: 6 horas (360 minutos)
 * - Duração máxima por aula individual: 2 horas (120 minutos)
 * - Número máximo de aulas por turno: 20 aulas
 *
 * Os períodos são considerados como:
 * - Manhã: tipicamente 6h às 12h (6 horas)
 * - Tarde: tipicamente 12h às 18h (6 horas)
 * - Noite: tipicamente 18h às 24h (6 horas)
 */

// Duração máxima por período em minutos (6 horas)
export const DURACAO_MAXIMA_PERIODO_MINUTOS = 360

// Duração máxima de uma aula individual em minutos (2 horas)
export const DURACAO_MAXIMA_AULA_MINUTOS = 120

// Número máximo de aulas por turno
export const NUMERO_MAXIMO_AULAS_POR_TURNO = 20

// Horários limite para cada turno (formato HH:mm)
export const HORARIOS_LIMITE_TURNOS = {
  manha: {
    inicio: "06:00",
    fim: "12:00",
    nome: "Manhã",
  },
  tarde: {
    inicio: "12:00",
    fim: "18:00",
    nome: "Tarde",
  },
  noite: {
    inicio: "18:00",
    fim: "23:59", // Até 23:59 para permitir início próximo à meia-noite
    nome: "Noite",
  },
} as const

export type TurnoType = keyof typeof HORARIOS_LIMITE_TURNOS

/**
 * Calcula se a duração total das aulas (duração × quantidade) excede o limite do período
 * @param duracaoAulaMinutos Duração de cada aula em minutos
 * @param numeroAulas Número de aulas no período
 * @returns true se está dentro do limite, false caso contrário
 */
export function validarDuracaoTotalPeriodo(
  duracaoAulaMinutos: number,
  numeroAulas: number,
): boolean {
  if (duracaoAulaMinutos <= 0 || numeroAulas <= 0) return true
  const duracaoTotal = duracaoAulaMinutos * numeroAulas
  return duracaoTotal <= DURACAO_MAXIMA_PERIODO_MINUTOS
}

/**
 * Valida se um horário está dentro dos limites permitidos para um turno específico
 * @param horario Horário no formato HH:mm
 * @param turno Tipo do turno (manha, tarde, noite)
 * @returns true se o horário está dentro dos limites, false caso contrário
 */
export function validarHorarioTurno(horario: string, turno: TurnoType): boolean {
  if (!horario || !turno) return false

  const limites = HORARIOS_LIMITE_TURNOS[turno]

  // Função auxiliar para converter HH:mm em minutos desde 00:00
  const horarioParaMinutos = (h: string): number => {
    const [horas, minutos] = h.split(":").map(Number)
    return horas * 60 + minutos
  }

  const horarioMinutos = horarioParaMinutos(horario)
  const inicioMinutos = horarioParaMinutos(limites.inicio)
  const fimMinutos = horarioParaMinutos(limites.fim)

  return horarioMinutos >= inicioMinutos && horarioMinutos <= fimMinutos
}

/**
 * Obtém a mensagem de erro para horário de turno inválido
 * @param turno Tipo do turno
 * @returns Mensagem de erro formatada
 */
export function getMensagemErroHorarioTurno(turno: TurnoType): string {
  const limites = HORARIOS_LIMITE_TURNOS[turno]
  return `O horário de início do turno da ${limites.nome.toLowerCase()} deve estar entre ${limites.inicio} e ${limites.fim}.`
}

/**
 * Formata a duração em minutos para uma string legível (ex: "2h 30min")
 * @param minutos Total de minutos
 * @returns String formatada
 */
export function formatarDuracao(minutos: number): string {
  if (minutos <= 0) return "0min"

  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60

  if (horas === 0) return `${minutosRestantes}min`
  if (minutosRestantes === 0) return `${horas}h`
  return `${horas}h ${minutosRestantes}min`
}

/**
 * Calcula a duração total das aulas
 * @param duracaoAulaMinutos Duração de cada aula em minutos
 * @param numeroAulas Número de aulas
 * @returns Total em minutos
 */
export function calcularDuracaoTotal(
  duracaoAulaMinutos: number,
  numeroAulas: number,
): number {
  return duracaoAulaMinutos * numeroAulas
}
