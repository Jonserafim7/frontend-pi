import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query"
import { getAlocacoesHorariosControllerDeleteMutationOptions } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { ErrorType } from "@/lib/orval-axios-instance"

/**
 * Hook para deletar uma alocação de horário.
 * Encapsula a chamada à API DELETE /alocacoes-horarios/{id}.
 *
 * As variáveis da mutação devem ser passadas como: { id: string }
 */
export function useDeleteAlocacaoMutation<
  TError = ErrorType<void>, // O endpoint de delete retorna void e não tem um tipo de erro específico definido
  TContext = unknown,
>(
  options?: Omit<
    UseMutationOptions<
      void, // Tipo de retorno em caso de sucesso (a API retorna 204 No Content)
      TError,
      { id: string }, // Variáveis da mutação (o que é passado para mutateFn)
      TContext
    >,
    "mutationFn"
  >,
  queryClient?: QueryClient,
): UseMutationResult<
  void,
  TError,
  { id: string }, // Tipo das variáveis que o hook expõe para mutate/mutateAsync
  TContext
> {
  const mutationOptions = getAlocacoesHorariosControllerDeleteMutationOptions<
    TError,
    TContext
  >({
    mutation: options,
  })

  return useMutation<void, TError, { id: string }, TContext>(
    mutationOptions,
    queryClient,
  )
}
