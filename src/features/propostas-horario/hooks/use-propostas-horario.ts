import {
  usePropostasHorarioControllerFindAll,
  usePropostasHorarioControllerFindOne,
  usePropostasHorarioControllerCreate,
  usePropostasHorarioControllerUpdate,
  usePropostasHorarioControllerRemove,
  usePropostasHorarioControllerSubmit,
  usePropostasHorarioControllerApprove,
  usePropostasHorarioControllerReject,
  usePropostasHorarioControllerReopen,
  usePropostasHorarioControllerSendBack,
  getPropostasHorarioControllerFindAllQueryKey,
  getPropostasHorarioControllerFindOneQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"

import type {
  PropostaHorarioResponseDto,
  CreatePropostaHorarioDto,
  UpdatePropostaHorarioDto,
  SubmitPropostaHorarioDto,
  ApprovePropostaDto,
  RejectPropostaDto,
} from "@/api-generated/model"

import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Hook para listar todas as propostas de horário
 * Retorna propostas filtradas pelo papel do usuário (feito no backend)
 */
export function usePropostasHorarioList() {
  return usePropostasHorarioControllerFindAll({
    query: {
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  })
}

/**
 * Hook para buscar uma proposta específica pelo ID
 */
export function usePropostaHorario(id: string) {
  return usePropostasHorarioControllerFindOne(id, {
    query: {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  })
}

/**
 * Hook para criar uma nova proposta de horário
 */
export function useCreateProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Proposta criada com sucesso!")
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao criar proposta")
      },
    },
  })
}

/**
 * Hook para atualizar uma proposta de horário (apenas DRAFT)
 */
export function useUpdateProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerUpdate({
    mutation: {
      onSuccess: (proposta) => {
        toast.success("Proposta atualizada com sucesso!")
        // Invalida a lista e o item específico
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindOneQueryKey(proposta.id),
        })
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erro ao atualizar proposta",
        )
      },
    },
  })
}

/**
 * Hook para remover uma proposta de horário (apenas DRAFT)
 */
export function useDeleteProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerRemove({
    mutation: {
      onSuccess: () => {
        toast.success("Proposta removida com sucesso!")
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao remover proposta")
      },
    },
  })
}

/**
 * Hook para submeter uma proposta para aprovação
 */
export function useSubmitProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerSubmit({
    mutation: {
      onSuccess: (proposta) => {
        toast.success("Proposta submetida para aprovação!")
        // Invalida a lista e o item específico
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindOneQueryKey(proposta.id),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao submeter proposta")
      },
    },
  })
}

/**
 * Hook para aprovar uma proposta (apenas diretores)
 */
export function useApproveProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerApprove({
    mutation: {
      onSuccess: (proposta) => {
        toast.success("Proposta aprovada com sucesso!")
        // Invalida a lista e o item específico
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindOneQueryKey(proposta.id),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao aprovar proposta")
      },
    },
  })
}

/**
 * Hook para rejeitar uma proposta (apenas diretores)
 */
export function useRejectProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerReject({
    mutation: {
      onSuccess: (proposta) => {
        toast.success("Proposta rejeitada")
        // Invalida a lista e o item específico
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindOneQueryKey(proposta.id),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao rejeitar proposta")
      },
    },
  })
}

/**
 * Hook para reabrir uma proposta rejeitada (coordenadores)
 */
export function useReopenProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerReopen({
    mutation: {
      onSuccess: (proposta) => {
        toast.success("Proposta reaberta para edição!")
        // Invalida a lista e o item específico
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindOneQueryKey(proposta.id),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao reabrir proposta")
      },
    },
  })
}

/**
 * Hook para devolver uma proposta aprovada para edição (diretores)
 */
export function useSendBackProposta() {
  const queryClient = useQueryClient()

  return usePropostasHorarioControllerSendBack({
    mutation: {
      onSuccess: (proposta) => {
        toast.success("Proposta devolvida para edição com sucesso!")
        // Invalida a lista e o item específico
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindAllQueryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindOneQueryKey(proposta.id),
        })
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Erro ao devolver proposta")
      },
    },
  })
}

// Tipos exportados para facilitar uso
export type {
  PropostaHorarioResponseDto,
  CreatePropostaHorarioDto,
  UpdatePropostaHorarioDto,
  SubmitPropostaHorarioDto,
  ApprovePropostaDto,
  RejectPropostaDto,
}
