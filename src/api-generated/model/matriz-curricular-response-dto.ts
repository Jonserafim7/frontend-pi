/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */
import type { DisciplinaResponseDto } from "./disciplina-response-dto"

export interface MatrizCurricularResponseDto {
  /** ID único da matriz curricular */
  id: string
  /** Nome da matriz curricular */
  nome: string
  /** ID do curso ao qual a matriz curricular pertence */
  idCurso: string
  /** Nome do curso ao qual a matriz curricular pertence */
  nomeCurso: string
  /** Data de criação da matriz curricular */
  createdAt: string
  /** Data da última atualização da matriz curricular */
  updatedAt: string
  /** Lista de disciplinas da matriz curricular */
  disciplinas: DisciplinaResponseDto[]
}
