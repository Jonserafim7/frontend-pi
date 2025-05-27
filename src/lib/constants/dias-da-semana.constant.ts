/**
 * Constantes e mapeamentos para dias da semana
 * Usado em múltiplos componentes do sistema de horários
 */

// Labels para os dados da tabela
export const DIAS_SEMANA_LABELS = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
} as const

// Constantes para componentes de grid
export const DIAS_SEMANA = [
  { key: "SEG", label: "Segunda", short: "SEG" },
  { key: "TER", label: "Terça", short: "TER" },
  { key: "QUA", label: "Quarta", short: "QUA" },
  { key: "QUI", label: "Quinta", short: "QUI" },
  { key: "SEX", label: "Sexta", short: "SEX" },
  { key: "SAB", label: "Sábado", short: "SAB" },
] as const

export type DiaSemanaKey = (typeof DIAS_SEMANA)[number]["key"]

// Mapeamento dos dias da semana da API para componentes
export const DIA_SEMANA_MAP = {
  SEGUNDA: "SEG",
  TERCA: "TER",
  QUARTA: "QUA",
  QUINTA: "QUI",
  SEXTA: "SEX",
  SABADO: "SAB",
} as const

export const DIA_SEMANA_REVERSE_MAP = {
  SEG: "SEGUNDA",
  TER: "TERCA",
  QUA: "QUARTA",
  QUI: "QUINTA",
  SEX: "SEXTA",
  SAB: "SABADO",
} as const

// Export default para manter compatibilidade
export default DIAS_SEMANA_LABELS
