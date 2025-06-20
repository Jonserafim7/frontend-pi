/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */
import type { CursoPropostaDtoCodigo } from "./curso-proposta-dto-codigo"

export interface CursoPropostaDto {
  /** ID do curso */
  id: string
  /** Nome do curso */
  nome: string
  /** Código do curso */
  codigo?: CursoPropostaDtoCodigo
}
