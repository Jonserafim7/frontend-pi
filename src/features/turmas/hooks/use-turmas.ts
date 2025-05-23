import {
  useTurmasControllerFindAll,
  useTurmasControllerFindOne,
  useTurmasControllerFindByDisciplinaOfertada,
  useTurmasControllerFindByProfessor,
  useTurmasControllerCreate,
  useTurmasControllerUpdate,
  useTurmasControllerRemove,
  useTurmasControllerAtribuirProfessor,
  useTurmasControllerRemoverProfessor,
} from "@/api-generated/client/turmas/turmas"
import type { TurmasControllerFindAllParams } from "@/api-generated/model"

/**
 * Hook para listar turmas com filtros
 * @param params - Parâmetros de filtro (opcional)
 */
export const useTurmas = (params?: TurmasControllerFindAllParams) => {
  return useTurmasControllerFindAll(params)
}

/**
 * Hook para buscar uma turma específica
 * @param id - ID da turma
 */
export const useTurma = (id: string) => {
  return useTurmasControllerFindOne(id)
}

/**
 * Hook para buscar turmas de uma disciplina ofertada
 * @param idDisciplinaOfertada - ID da disciplina ofertada
 */
export const useTurmasByDisciplinaOfertada = (idDisciplinaOfertada: string) => {
  return useTurmasControllerFindByDisciplinaOfertada(idDisciplinaOfertada)
}

/**
 * Hook para buscar turmas de um professor
 * @param idProfessor - ID do professor
 */
export const useTurmasByProfessor = (idProfessor: string) => {
  return useTurmasControllerFindByProfessor(idProfessor)
}

/**
 * Hook para criar uma nova turma
 */
export const useCreateTurma = () => {
  return useTurmasControllerCreate()
}

/**
 * Hook para atualizar uma turma
 */
export const useUpdateTurma = () => {
  return useTurmasControllerUpdate()
}

/**
 * Hook para deletar uma turma
 */
export const useDeleteTurma = () => {
  return useTurmasControllerRemove()
}

/**
 * Hook para atribuir professor à turma
 */
export const useAtribuirProfessor = () => {
  return useTurmasControllerAtribuirProfessor()
}

/**
 * Hook para remover professor da turma
 */
export const useRemoverProfessor = () => {
  return useTurmasControllerRemoverProfessor()
}
