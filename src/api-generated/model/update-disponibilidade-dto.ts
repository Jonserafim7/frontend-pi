/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */
import type { UpdateDisponibilidadeDtoDiaDaSemana } from "./update-disponibilidade-dto-dia-da-semana"
import type { UpdateDisponibilidadeDtoStatus } from "./update-disponibilidade-dto-status"

export interface UpdateDisponibilidadeDto {
  /** Dia da semana */
  diaDaSemana?: UpdateDisponibilidadeDtoDiaDaSemana
  /**
   * Horário de início (formato HH:mm)
   * @pattern ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
   */
  horaInicio?: string
  /**
   * Horário de fim (formato HH:mm)
   * @pattern ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
   */
  horaFim?: string
  /** Status da disponibilidade */
  status?: UpdateDisponibilidadeDtoStatus
}
