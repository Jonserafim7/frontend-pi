import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  useDisponibilidadeProfessorControllerCreate,
  useDisponibilidadeProfessorControllerUpdate,
  useDisponibilidadeProfessorControllerRemove,
  useDisponibilidadeProfessorControllerFindAll,
  useDisponibilidadeProfessorControllerFindByProfessor,
  useDisponibilidadeProfessorControllerFindByPeriodo,
  useDisponibilidadeProfessorControllerFindByProfessorAndPeriodo,
  useDisponibilidadeProfessorControllerFindOne,
  getDisponibilidadeProfessorControllerFindAllQueryKey,
  getDisponibilidadeProfessorControllerFindByProfessorQueryKey,
  getDisponibilidadeProfessorControllerFindByPeriodoQueryKey,
  getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey,
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
  const queryClient = useQueryClient()

  return useDisponibilidadeProfessorControllerCreate({
    mutation: {
      onSuccess: (data) => {
        // Invalidar todas as queries relacionadas às disponibilidades

        // 1. Query geral de disponibilidades
        queryClient.invalidateQueries({
          queryKey: getDisponibilidadeProfessorControllerFindAllQueryKey(),
        })

        // 2. Query específica do professor
        if (data.usuarioProfessor?.id) {
          queryClient.invalidateQueries({
            queryKey:
              getDisponibilidadeProfessorControllerFindByProfessorQueryKey(
                data.usuarioProfessor.id,
              ),
          })
        }

        // 3. Query específica do período letivo
        if (data.periodoLetivo?.id) {
          queryClient.invalidateQueries({
            queryKey: getDisponibilidadeProfessorControllerFindByPeriodoQueryKey(
              data.periodoLetivo.id,
            ),
          })
        }

        // 4. Query combinada professor + período
        if (data.usuarioProfessor?.id && data.periodoLetivo?.id) {
          queryClient.invalidateQueries({
            queryKey:
              getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey(
                data.usuarioProfessor.id,
                data.periodoLetivo.id,
              ),
          })
        }

        toast.success("Disponibilidade criada com sucesso!")
      },
      onError: (error) => {
        // Tratamento específico para conflitos de horário
        if ((error as any)?.response?.status === 400) {
          const errorMessage =
            (error as any)?.response?.data?.message || (error as any)?.message

          if (
            errorMessage?.includes("conflitante") ||
            errorMessage?.includes("conflito")
          ) {
            toast.error("⚠️ Conflito de Horário", {
              description: errorMessage,
              duration: 5000,
            })
            return
          }
        }

        // Erro genérico
        toast.error("Erro ao criar disponibilidade. Tente novamente.")
      },
    },
  })
}

/**
 * Hook para atualizar disponibilidade
 */
export function useUpdateDisponibilidade() {
  const queryClient = useQueryClient()

  return useDisponibilidadeProfessorControllerUpdate({
    mutation: {
      onSuccess: (data) => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({
          queryKey: getDisponibilidadeProfessorControllerFindAllQueryKey(),
        })

        if (data.usuarioProfessor?.id) {
          queryClient.invalidateQueries({
            queryKey:
              getDisponibilidadeProfessorControllerFindByProfessorQueryKey(
                data.usuarioProfessor.id,
              ),
          })
        }

        if (data.periodoLetivo?.id) {
          queryClient.invalidateQueries({
            queryKey: getDisponibilidadeProfessorControllerFindByPeriodoQueryKey(
              data.periodoLetivo.id,
            ),
          })
        }

        if (data.usuarioProfessor?.id && data.periodoLetivo?.id) {
          queryClient.invalidateQueries({
            queryKey:
              getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey(
                data.usuarioProfessor.id,
                data.periodoLetivo.id,
              ),
          })
        }

        toast.success("Disponibilidade atualizada com sucesso!")
      },
      onError: (error) => {
        // Tratamento específico para conflitos de horário
        if ((error as any)?.response?.status === 400) {
          const errorMessage =
            (error as any)?.response?.data?.message || (error as any)?.message

          if (
            errorMessage?.includes("conflitante") ||
            errorMessage?.includes("conflito")
          ) {
            toast.error("⚠️ Conflito de Horário", {
              description: errorMessage,
              duration: 5000,
            })
            return
          }
        }

        toast.error("Erro ao atualizar disponibilidade. Tente novamente.")
      },
    },
  })
}

/**
 * Hook para remover disponibilidade
 */
export function useDeleteDisponibilidade() {
  const queryClient = useQueryClient()

  return useDisponibilidadeProfessorControllerRemove({
    mutation: {
      onSuccess: () => {
        // Invalidar todas as queries de disponibilidades após exclusão
        queryClient.invalidateQueries({
          queryKey: getDisponibilidadeProfessorControllerFindAllQueryKey(),
        })

        // Como não temos acesso aos dados da disponibilidade excluída,
        // invalidamos queries mais abrangentes
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey
            return queryKey.some(
              (key) => typeof key === "string" && key.includes("disponibilidade"),
            )
          },
        })

        toast.success("Disponibilidade removida com sucesso!")
      },
      onError: () => {
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
