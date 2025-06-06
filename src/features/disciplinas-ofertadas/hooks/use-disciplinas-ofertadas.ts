import { useQueryClient } from "@tanstack/react-query"
import {
  useDisciplinasOfertadasControllerCreate,
  useDisciplinasOfertadasControllerUpdate,
  useDisciplinasOfertadasControllerRemove,
  useDisciplinasOfertadasControllerFindAll,
  useDisciplinasOfertadasControllerFindOne,
  getDisciplinasOfertadasControllerFindAllQueryKey,
} from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import { toast } from "sonner"

/**
 * Hook customizado para criar disciplina ofertada
 */
export function useCreateDisciplinaOfertada() {
  const queryClient = useQueryClient()

  return useDisciplinasOfertadasControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Disciplina ofertada criada")
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({
          queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(error.message || "Ocorreu um erro inesperado.")
      },
    },
  })
}

/**
 * Hook customizado para atualizar disciplina ofertada
 */
export function useUpdateDisciplinaOfertada() {
  const queryClient = useQueryClient()

  return useDisciplinasOfertadasControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Disciplina ofertada atualizada")
        queryClient.invalidateQueries({
          queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(error.message || "Ocorreu um erro inesperado.")
      },
    },
  })
}

/**
 * Hook customizado para remover disciplina ofertada
 */
export function useDeleteDisciplinaOfertada() {
  const queryClient = useQueryClient()

  return useDisciplinasOfertadasControllerRemove({
    mutation: {
      onSuccess: () => {
        toast.success("Disciplina ofertada removida")
        queryClient.invalidateQueries({
          queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(error.message || "Ocorreu um erro inesperado.")
      },
    },
  })
}

/**
 * Hook para buscar todas as disciplinas ofertadas
 */
export function useDisciplinasOfertadas() {
  return useDisciplinasOfertadasControllerFindAll()
}

/**
 * Hook para buscar uma disciplina ofertada específica
 */
export function useDisciplinaOfertada(id: string) {
  return useDisciplinasOfertadasControllerFindOne(id)
}
