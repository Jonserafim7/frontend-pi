import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  useAlocacoesHorariosControllerFindMany,
  useAlocacoesHorariosControllerFindByTurma,
  useAlocacoesHorariosControllerCreate,
  useAlocacoesHorariosControllerDelete,
  useAlocacoesHorariosControllerValidate,
  getAlocacoesHorariosControllerFindManyQueryKey,
  getAlocacoesHorariosControllerFindByTurmaQueryKey,
} from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type {
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoDto,
  AlocacoesHorariosControllerFindManyParams,
} from "@/api-generated/model"
import { mapAlocacaoToDisplay, type AlocacaoDisplay } from "../types"

/**
 * Hook para buscar todas as alocações com filtros e mapear para display
 */
export function useAlocacoes(params?: AlocacoesHorariosControllerFindManyParams) {
  const query = useAlocacoesHorariosControllerFindMany(params)

  const alocacoesDisplay = useMemo(() => {
    if (!query.data) return []
    return query.data.map(mapAlocacaoToDisplay)
  }, [query.data])

  return {
    ...query,
    data: alocacoesDisplay,
  }
}

/**
 * Hook para buscar alocações de uma turma específica
 */
export function useAlocacoesTurma(idTurma: string) {
  const query = useAlocacoesHorariosControllerFindByTurma(idTurma)

  const alocacoesDisplay = useMemo(() => {
    if (!query.data) return []
    return query.data.map(mapAlocacaoToDisplay)
  }, [query.data])

  return {
    ...query,
    data: alocacoesDisplay,
  }
}

/**
 * Hook para criar alocação
 */
export function useCreateAlocacao() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useAlocacoesHorariosControllerCreate({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Alocação criada",
          description: "Horário alocado com sucesso!",
        })

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({
          queryKey: getAlocacoesHorariosControllerFindManyQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getAlocacoesHorariosControllerFindByTurmaQueryKey(
            data.idTurma,
          ),
        })
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao criar alocação",
          description: error?.response?.data?.message || "Erro inesperado",
          variant: "destructive",
        })
      },
    },
  })
}

/**
 * Hook para deletar alocação
 */
export function useDeleteAlocacao() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useAlocacoesHorariosControllerDelete({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Alocação removida",
          description: "Horário removido com sucesso!",
        })

        // Invalidar todas as queries de alocações
        queryClient.invalidateQueries({
          queryKey: getAlocacoesHorariosControllerFindManyQueryKey(),
        })
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao remover alocação",
          description: error?.response?.data?.message || "Erro inesperado",
          variant: "destructive",
        })
      },
    },
  })
}

/**
 * Hook para validar alocação antes de criar
 */
export function useValidateAlocacao() {
  const { toast } = useToast()

  return useAlocacoesHorariosControllerValidate({
    mutation: {
      onError: (error: any) => {
        toast({
          title: "Erro na validação",
          description: error?.response?.data?.message || "Erro inesperado",
          variant: "destructive",
        })
      },
    },
  })
}

/**
 * Utilitário para criar alocação com validação
 */
export function useCreateAlocacaoWithValidation() {
  const createMutation = useCreateAlocacao()
  const validateMutation = useValidateAlocacao()

  const createWithValidation = async (data: CreateAlocacaoHorarioDto) => {
    try {
      // Primeiro valida
      const validation = await validateMutation.mutateAsync({ data })

      if (validation.valid) {
        // Se válida, cria a alocação
        return await createMutation.mutateAsync({ data })
      } else {
        throw new Error(validation.error || "Alocação inválida")
      }
    } catch (error) {
      throw error
    }
  }

  return {
    createWithValidation,
    isLoading: createMutation.isPending || validateMutation.isPending,
    error: createMutation.error || validateMutation.error,
  }
}
