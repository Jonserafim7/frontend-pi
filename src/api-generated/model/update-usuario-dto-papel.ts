/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */

/**
 * Papel do usuário no sistema
 */
export type UpdateUsuarioDtoPapel =
  (typeof UpdateUsuarioDtoPapel)[keyof typeof UpdateUsuarioDtoPapel]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdateUsuarioDtoPapel = {
  ADMIN: "ADMIN",
  DIRETOR: "DIRETOR",
  COORDENADOR: "COORDENADOR",
  PROFESSOR: "PROFESSOR",
} as const
