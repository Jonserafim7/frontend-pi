import { toast } from "sonner"
import {
  useDisponibilidadeProfessorControllerCreate,
  useDisponibilidadeProfessorControllerUpdate,
  useDisponibilidadeProfessorControllerRemove,
  useDisponibilidadeProfessorControllerFindAll,
  useDisponibilidadeProfessorControllerFindByProfessor,
  useDisponibilidadeProfessorControllerFindByPeriodo,
  useDisponibilidadeProfessorControllerFindByProfessorAndPeriodo,
  useDisponibilidadeProfessorControllerFindOne,
} from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import type { DisponibilidadeProfessorControllerFindAllParams } from "@/api-generated/model"

/**
 * Hook para listar disponibilidades com filtros
 */
export function useDisponibilidades(
  params?: DisponibilidadeProfessorControllerFindAllParams,
) {
  return useDisponibilidadeProfessorControllerFindAll(params)
}

/**
 * Hook para buscar disponibilidades por professor
 */
export function useDisponibilidadesByProfessor(
  professorId: string,
  params?: Omit<DisponibilidadeProfessorControllerFindAllParams, "professorId">,
) {
  return useDisponibilidadeProfessorControllerFindByProfessor(professorId, params)
}

/**
 * Hook para buscar disponibilidades por período
 */
export function useDisponibilidadesByPeriodo(
  periodoId: string,
  params?: Omit<
    DisponibilidadeProfessorControllerFindAllParams,
    "periodoLetivoId"
  >,
) {
  return useDisponibilidadeProfessorControllerFindByPeriodo(periodoId, params)
}

/**
 * Hook para buscar disponibilidades por professor e período
 */
export function useDisponibilidadesByProfessorAndPeriodo(
  professorId: string,
  periodoId: string,
) {
  return useDisponibilidadeProfessorControllerFindByProfessorAndPeriodo(
    professorId,
    periodoId,
  )
}

/**
 * Hook para buscar uma disponibilidade específica
 */
export function useDisponibilidade(id: string) {
  return useDisponibilidadeProfessorControllerFindOne(id)
}

/**
 * Hook para criar nova disponibilidade
 */
export function useCreateDisponibilidade() {
  return useDisponibilidadeProfessorControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Disponibilidade criada com sucesso!")
      },
      onError: (error) => {
        console.error("Erro ao criar disponibilidade:", error)
        toast.error("Erro ao criar disponibilidade. Tente novamente.")
      },
    },
  })
}

/**
 * Hook para atualizar disponibilidade
 */
export function useUpdateDisponibilidade() {
  return useDisponibilidadeProfessorControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Disponibilidade atualizada com sucesso!")
      },
      onError: (error) => {
        console.error("Erro ao atualizar disponibilidade:", error)
        toast.error("Erro ao atualizar disponibilidade. Tente novamente.")
      },
    },
  })
}

/**
 * Hook para remover disponibilidade
 */
export function useDeleteDisponibilidade() {
  return useDisponibilidadeProfessorControllerRemove({
    mutation: {
      onSuccess: () => {
        toast.success("Disponibilidade removida com sucesso!")
      },
      onError: (error) => {
        console.error("Erro ao remover disponibilidade:", error)
        toast.error("Erro ao remover disponibilidade. Tente novamente.")
      },
    },
  })
}

// Mantemos as chaves de query para compatibilidade, mas agora são gerenciadas pelo orval
export const disponibilidadeKeys = {
  all: ["disponibilidades"] as const,
  lists: () => [...disponibilidadeKeys.all, "list"] as const,
  list: (filters: DisponibilidadeProfessorControllerFindAllParams) =>
    [...disponibilidadeKeys.lists(), filters] as const,
  details: () => [...disponibilidadeKeys.all, "detail"] as const,
  detail: (id: string) => [...disponibilidadeKeys.details(), id] as const,
  byProfessor: (professorId: string) =>
    [...disponibilidadeKeys.all, "professor", professorId] as const,
  byPeriodo: (periodoId: string) =>
    [...disponibilidadeKeys.all, "periodo", periodoId] as const,
  byProfessorAndPeriodo: (professorId: string, periodoId: string) =>
    [
      ...disponibilidadeKeys.all,
      "professor",
      professorId,
      "periodo",
      periodoId,
    ] as const,
}
