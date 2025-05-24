import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  useDisciplinasOfertadasControllerCreate,
  useDisciplinasOfertadasControllerUpdate,
  useDisciplinasOfertadasControllerRemove,
  useDisciplinasOfertadasControllerFindAll,
  useDisciplinasOfertadasControllerFindOne,
  getDisciplinasOfertadasControllerFindAllQueryKey,
} from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"

/**
 * Hook customizado para criar disciplina ofertada
 */
export function useCreateDisciplinaOfertada() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useDisciplinasOfertadasControllerCreate({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Disciplina ofertada criada",
          description: "A disciplina foi ofertada com sucesso.",
        })
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({
          queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
        })
      },
      onError: (error) => {
        toast({
          title: "Erro ao ofertar disciplina",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        })
      },
    },
  })
}

/**
 * Hook customizado para atualizar disciplina ofertada
 */
export function useUpdateDisciplinaOfertada() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useDisciplinasOfertadasControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Disciplina ofertada atualizada",
          description: "As alterações foram salvas com sucesso.",
        })
        queryClient.invalidateQueries({
          queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
        })
      },
      onError: (error) => {
        toast({
          title: "Erro ao atualizar oferta",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        })
      },
    },
  })
}

/**
 * Hook customizado para remover disciplina ofertada
 */
export function useDeleteDisciplinaOfertada() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useDisciplinasOfertadasControllerRemove({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Disciplina ofertada removida",
          description: "A oferta foi removida com sucesso.",
        })
        queryClient.invalidateQueries({
          queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
        })
      },
      onError: (error) => {
        toast({
          title: "Erro ao remover oferta",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        })
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
