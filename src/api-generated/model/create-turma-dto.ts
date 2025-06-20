/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */

export interface CreateTurmaDto {
  /** ID da disciplina ofertada à qual esta turma pertence. */
  idDisciplinaOfertada: string
  /** Código/identificador da turma (ex: T1, T2, A, B). */
  codigoDaTurma: string
}
