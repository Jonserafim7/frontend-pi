import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  usePropostasHorarioControllerCreate,
  getPropostasHorarioControllerFindMinhasPropostasQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import type {
  CreatePropostaHorarioDto,
  PropostaHorarioResponseDto,
} from "@/api-generated/model"

export interface CreatePropostaOptions {
  idCurso: string
  idPeriodoLetivo: string
  observacoesCoordenador?: string
}

export interface UseCreatePropostaReturn {
  /** Função para criar nova proposta */
  createProposta: (
    options: CreatePropostaOptions,
  ) => Promise<PropostaHorarioResponseDto>
  /** Indica se está criando */
  isCreating: boolean
}

/**
 * Hook para criação de novas propostas de horário
 * MVP: Validações mínimas, apenas campos obrigatórios
 */
export function useCreateProposta(): UseCreatePropostaReturn {
  const queryClient = useQueryClient()
  const createMutation = usePropostasHorarioControllerCreate()

  // Invalidar cache após criação
  const invalidateCache = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindMinhasPropostasQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindAllQueryKey(),
      }),
    ])
  }, [queryClient])

  // Criar nova proposta
  const createProposta = useCallback(
    async (
      options: CreatePropostaOptions,
    ): Promise<PropostaHorarioResponseDto> => {
      try {
        const createData: CreatePropostaHorarioDto = {
          idCurso: options.idCurso,
          idPeriodoLetivo: options.idPeriodoLetivo,
          observacoesCoordenador: options.observacoesCoordenador,
        }

        const result = await createMutation.mutateAsync({ data: createData })

        toast.success("Proposta criada com sucesso")
        await invalidateCache()

        return result
      } catch (error) {
        toast.error("Erro ao criar proposta")
        throw error
      }
    },
    [createMutation, invalidateCache],
  )

  return {
    createProposta,
    isCreating: createMutation.isPending,
  }
}
