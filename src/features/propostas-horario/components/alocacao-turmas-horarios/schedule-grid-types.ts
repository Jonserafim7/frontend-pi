import type {
  AulaHorarioDto,
  AlocacaoHorarioResponseDto,
} from "@/api-generated/model"

/**
 * Constante que define os dias da semana utilizados na grade de horários.
 * Cada dia possui uma chave (key) e um rótulo (label) para exibição.
 *
 * @example
 * DIAS_SEMANA[0] // { key: "SEGUNDA", label: "Segunda" }
 */
export const DIAS_SEMANA = [
  { key: "SEGUNDA", label: "Segunda" },
  { key: "TERCA", label: "Terça" },
  { key: "QUARTA", label: "Quarta" },
  { key: "QUINTA", label: "Quinta" },
  { key: "SEXTA", label: "Sexta" },
  { key: "SABADO", label: "Sábado" },
] as const

/**
 * Tipo utilitário para as chaves dos dias da semana.
 *
 * @example
 * const dia: DiaSemanaKey = "SEGUNDA"
 */
export type DiaSemanaKey = (typeof DIAS_SEMANA)[number]["key"]

/**
 * Props do componente ScheduleGrid.
 * @property className Classe CSS opcional para estilização externa.
 */
export interface ScheduleGridProps {
  className?: string
}

/**
 * Props para o componente TurnoSection, que representa uma seção da grade (manhã, tarde, noite).
 * @property titulo Nome do turno (ex: "Manhã").
 * @property aulas Lista de objetos representando os horários das aulas do turno.
 * @property inicio Horário de início do turno.
 * @property fim Horário de término do turno.
 * @property alocacoesMap Mapa para busca rápida das alocações por dia e horário.
 */
export interface TurnoSectionProps {
  titulo: string
  aulas: AulaHorarioDto[]
  inicio: string
  fim: string
  alocacoesMap: Map<string, AlocacaoHorarioResponseDto>
}

/**
 * Props para o componente ScheduleCell, que representa uma célula individual da grade.
 * @property dia Dia da semana (chave).
 * @property horario Objeto com informações do horário da aula.
 * @property alocacao (Opcional) Alocação existente para o dia/horário, se houver.
 */
export interface ScheduleCellProps {
  dia: DiaSemanaKey
  horario: AulaHorarioDto
  alocacao?: AlocacaoHorarioResponseDto
}
