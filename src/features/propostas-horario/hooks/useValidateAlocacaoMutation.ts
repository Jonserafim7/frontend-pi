import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query"
import type {
  ValidateAlocacaoDto,
  ValidateAlocacaoResponseDto,
} from "@/api-generated/model"
import {
  getAlocacoesHorariosControllerValidateMutationOptions,
  alocacoesHorariosControllerValidate,
} from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { ErrorType, BodyType } from "@/lib/orval-axios-instance"
import { orvalCustomInstance } from "@/lib/orval-axios-instance"

/**
 * Hook para validar uma alocação de horário.
 * Encapsula a chamada à API POST /alocacoes-horarios/validate.
 */
export function useValidateAlocacaoMutation<
  TError = ErrorType<unknown>, // Por padrão, o erro da API é unknown, ajuste se souber o tipo específico
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof alocacoesHorariosControllerValidate>>,
      TError,
      { data: BodyType<ValidateAlocacaoDto> },
      TContext
    >
    request?: Parameters<typeof orvalCustomInstance>[1]
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof alocacoesHorariosControllerValidate>>,
  TError,
  { data: BodyType<ValidateAlocacaoDto> },
  TContext
> {
  const mutationOptions = getAlocacoesHorariosControllerValidateMutationOptions<
    TError,
    TContext
  >(options)

  return useMutation(mutationOptions, queryClient)
}

// Tipos exportados para facilitar o uso do hook
export type ValidateAlocacaoMutationResult = ValidateAlocacaoResponseDto // O resultado da mutação é o DTO de resposta
export type ValidateAlocacaoMutationBody = BodyType<ValidateAlocacaoDto>
export type ValidateAlocacaoMutationError = ErrorType<unknown> // Ajuste se souber o tipo de erro específico
