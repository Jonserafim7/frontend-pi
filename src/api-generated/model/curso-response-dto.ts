/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */
import type { CoordenadorSimplificadoDto } from "./coordenador-simplificado-dto"

export interface CursoResponseDto {
  /** ID único do curso no formato UUID v4 */
  id: string
  /**
   * Nome completo do curso
   * @maxLength 100
   */
  nome: string
  /**
   * Código único de identificação do curso
   * @maxLength 20
   */
  codigo: string
  /** Data de criação do registro no formato ISO 8601 */
  dataCriacao: string
  /** Data da última atualização no formato ISO 8601 */
  dataAtualizacao: string
  /** Coordenador principal do curso */
  coordenadorPrincipal?: CoordenadorSimplificadoDto
}
