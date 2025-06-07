import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query"
import type {
  CreateAlocacaoHorarioDto,
  AlocacaoHorarioResponseDto,
} from "@/api-generated/model"
import { getAlocacoesHorariosControllerCreateMutationOptions } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { ErrorType, BodyType } from "@/lib/orval-axios-instance"

/**
 * Hook para criar uma nova alocação de horário.
 * Encapsula a chamada à API POST /alocacoes-horarios.
 *
 * As variáveis da mutação devem ser passadas como: { data: CreateAlocacaoHorarioDto }
 */
export function useCreateAlocacaoMutation<
  TError = ErrorType<void>, // O endpoint de create não tem um tipo de erro específico definido no swagger, default para void
  TContext = unknown,
>(
  // Opções para o hook useMutation do React Query
  options?: Omit<
    UseMutationOptions<
      AlocacaoHorarioResponseDto, // Tipo de retorno em caso de sucesso
      TError,
      { data: BodyType<CreateAlocacaoHorarioDto> }, // Variáveis da mutação (o que é passado para mutateFn)
      TContext
    >,
    "mutationFn"
  >, // Omitimos mutationFn porque será fornecida por get...MutationOptions
  queryClient?: QueryClient,
): UseMutationResult<
  AlocacaoHorarioResponseDto,
  TError,
  { data: BodyType<CreateAlocacaoHorarioDto> }, // Tipo das variáveis que o hook expõe para mutate/mutateAsync
  TContext
> {
  // Obtém as opções de mutação, incluindo a mutationFn que chama o endpoint da API.
  // O tipo das variáveis aqui já é { data: BodyType<CreateAlocacaoHorarioDto> }
  const mutationOptions = getAlocacoesHorariosControllerCreateMutationOptions<
    TError,
    TContext
  >({
    mutation: options, // Passa as opções customizadas do usuário (como onSuccess, onError, etc.)
    // request: pode ser usado para passar opções adicionais para o orvalCustomInstance se necessário
  })

  // Retorna o hook de mutação do react-query usando as opções configuradas.
  return useMutation<
    AlocacaoHorarioResponseDto,
    TError,
    { data: BodyType<CreateAlocacaoHorarioDto> },
    TContext
  >(mutationOptions, queryClient)
}
