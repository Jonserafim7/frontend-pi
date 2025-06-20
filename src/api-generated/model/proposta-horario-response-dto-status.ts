/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */

/**
 * Status atual da proposta
 */
export type PropostaHorarioResponseDtoStatus =
  (typeof PropostaHorarioResponseDtoStatus)[keyof typeof PropostaHorarioResponseDtoStatus]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PropostaHorarioResponseDtoStatus = {
  DRAFT: "DRAFT",
  PENDENTE_APROVACAO: "PENDENTE_APROVACAO",
  APROVADA: "APROVADA",
  REJEITADA: "REJEITADA",
} as const
