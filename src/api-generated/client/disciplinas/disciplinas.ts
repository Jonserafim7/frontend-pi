/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * API Horários Acadêmicos
 * Documentação da API para o Sistema de Elaboração de Horário e Atribuição de Disciplinas
 * OpenAPI spec version: 1.0
 */
import { useMutation, useQuery } from "@tanstack/react-query"
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"

import type {
  CreateDisciplinaDto,
  DisciplinaResponseDto,
  DisciplinasControllerFindAllParams,
  UpdateDisciplinaDto,
} from "../../model"

import { orvalCustomInstance } from "../../../lib/orval-axios-instance"
import type { ErrorType, BodyType } from "../../../lib/orval-axios-instance"

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1]

/**
 * @summary Criar uma nova disciplina
 */
export const disciplinasControllerCreate = (
  createDisciplinaDto: BodyType<CreateDisciplinaDto>,
  options?: SecondParameter<typeof orvalCustomInstance>,
  signal?: AbortSignal,
) => {
  return orvalCustomInstance<DisciplinaResponseDto>(
    {
      url: `/disciplinas`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createDisciplinaDto,
      signal,
    },
    options,
  )
}

export const getDisciplinasControllerCreateMutationOptions = <
  TError = ErrorType<void>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof disciplinasControllerCreate>>,
    TError,
    { data: BodyType<CreateDisciplinaDto> },
    TContext
  >
  request?: SecondParameter<typeof orvalCustomInstance>
}): UseMutationOptions<
  Awaited<ReturnType<typeof disciplinasControllerCreate>>,
  TError,
  { data: BodyType<CreateDisciplinaDto> },
  TContext
> => {
  const mutationKey = ["disciplinasControllerCreate"]
  const { mutation: mutationOptions, request: requestOptions } =
    options ?
      (
        options.mutation &&
        "mutationKey" in options.mutation &&
        options.mutation.mutationKey
      ) ?
        options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof disciplinasControllerCreate>>,
    { data: BodyType<CreateDisciplinaDto> }
  > = (props) => {
    const { data } = props ?? {}

    return disciplinasControllerCreate(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type DisciplinasControllerCreateMutationResult = NonNullable<
  Awaited<ReturnType<typeof disciplinasControllerCreate>>
>
export type DisciplinasControllerCreateMutationBody =
  BodyType<CreateDisciplinaDto>
export type DisciplinasControllerCreateMutationError = ErrorType<void>

/**
 * @summary Criar uma nova disciplina
 */
export const useDisciplinasControllerCreate = <
  TError = ErrorType<void>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof disciplinasControllerCreate>>,
      TError,
      { data: BodyType<CreateDisciplinaDto> },
      TContext
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof disciplinasControllerCreate>>,
  TError,
  { data: BodyType<CreateDisciplinaDto> },
  TContext
> => {
  const mutationOptions = getDisciplinasControllerCreateMutationOptions(options)

  return useMutation(mutationOptions, queryClient)
}
/**
 * @summary Listar todas as disciplinas
 */
export const disciplinasControllerFindAll = (
  params?: DisciplinasControllerFindAllParams,
  options?: SecondParameter<typeof orvalCustomInstance>,
  signal?: AbortSignal,
) => {
  return orvalCustomInstance<DisciplinaResponseDto[]>(
    { url: `/disciplinas`, method: "GET", params, signal },
    options,
  )
}

export const getDisciplinasControllerFindAllQueryKey = (
  params?: DisciplinasControllerFindAllParams,
) => {
  return ["disciplinas", ...(params ? [params] : [])] as const
}

export const getDisciplinasControllerFindAllQueryOptions = <
  TData = Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
  TError = ErrorType<void>,
>(
  params?: DisciplinasControllerFindAllParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey =
    queryOptions?.queryKey ?? getDisciplinasControllerFindAllQueryKey(params)

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof disciplinasControllerFindAll>>
  > = ({ signal }) => disciplinasControllerFindAll(params, requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type DisciplinasControllerFindAllQueryResult = NonNullable<
  Awaited<ReturnType<typeof disciplinasControllerFindAll>>
>
export type DisciplinasControllerFindAllQueryError = ErrorType<void>

export function useDisciplinasControllerFindAll<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
  TError = ErrorType<void>,
>(
  params: undefined | DisciplinasControllerFindAllParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
          TError,
          Awaited<ReturnType<typeof disciplinasControllerFindAll>>
        >,
        "initialData"
      >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
}
export function useDisciplinasControllerFindAll<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
  TError = ErrorType<void>,
>(
  params?: DisciplinasControllerFindAllParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
          TError,
          Awaited<ReturnType<typeof disciplinasControllerFindAll>>
        >,
        "initialData"
      >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useDisciplinasControllerFindAll<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
  TError = ErrorType<void>,
>(
  params?: DisciplinasControllerFindAllParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Listar todas as disciplinas
 */

export function useDisciplinasControllerFindAll<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
  TError = ErrorType<void>,
>(
  params?: DisciplinasControllerFindAllParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindAll>>,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
} {
  const queryOptions = getDisciplinasControllerFindAllQueryOptions(
    params,
    options,
  )

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Buscar disciplina por ID
 */
export const disciplinasControllerFindOne = (
  id: string,
  options?: SecondParameter<typeof orvalCustomInstance>,
  signal?: AbortSignal,
) => {
  return orvalCustomInstance<DisciplinaResponseDto>(
    { url: `/disciplinas/${id}`, method: "GET", signal },
    options,
  )
}

export const getDisciplinasControllerFindOneQueryKey = (id: string) => {
  return ["disciplinas", id] as const
}

export const getDisciplinasControllerFindOneQueryOptions = <
  TData = Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
  TError = ErrorType<void>,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey =
    queryOptions?.queryKey ?? getDisciplinasControllerFindOneQueryKey(id)

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof disciplinasControllerFindOne>>
  > = ({ signal }) => disciplinasControllerFindOne(id, requestOptions, signal)

  return { queryKey, queryFn, enabled: !!id, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type DisciplinasControllerFindOneQueryResult = NonNullable<
  Awaited<ReturnType<typeof disciplinasControllerFindOne>>
>
export type DisciplinasControllerFindOneQueryError = ErrorType<void>

export function useDisciplinasControllerFindOne<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
  TError = ErrorType<void>,
>(
  id: string,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
          TError,
          Awaited<ReturnType<typeof disciplinasControllerFindOne>>
        >,
        "initialData"
      >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
}
export function useDisciplinasControllerFindOne<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
  TError = ErrorType<void>,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
          TError,
          Awaited<ReturnType<typeof disciplinasControllerFindOne>>
        >,
        "initialData"
      >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useDisciplinasControllerFindOne<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
  TError = ErrorType<void>,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Buscar disciplina por ID
 */

export function useDisciplinasControllerFindOne<
  TData = Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
  TError = ErrorType<void>,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof disciplinasControllerFindOne>>,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
} {
  const queryOptions = getDisciplinasControllerFindOneQueryOptions(id, options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Atualizar disciplina por ID
 */
export const disciplinasControllerUpdate = (
  id: string,
  updateDisciplinaDto: BodyType<UpdateDisciplinaDto>,
  options?: SecondParameter<typeof orvalCustomInstance>,
) => {
  return orvalCustomInstance<DisciplinaResponseDto>(
    {
      url: `/disciplinas/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateDisciplinaDto,
    },
    options,
  )
}

export const getDisciplinasControllerUpdateMutationOptions = <
  TError = ErrorType<void>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof disciplinasControllerUpdate>>,
    TError,
    { id: string; data: BodyType<UpdateDisciplinaDto> },
    TContext
  >
  request?: SecondParameter<typeof orvalCustomInstance>
}): UseMutationOptions<
  Awaited<ReturnType<typeof disciplinasControllerUpdate>>,
  TError,
  { id: string; data: BodyType<UpdateDisciplinaDto> },
  TContext
> => {
  const mutationKey = ["disciplinasControllerUpdate"]
  const { mutation: mutationOptions, request: requestOptions } =
    options ?
      (
        options.mutation &&
        "mutationKey" in options.mutation &&
        options.mutation.mutationKey
      ) ?
        options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof disciplinasControllerUpdate>>,
    { id: string; data: BodyType<UpdateDisciplinaDto> }
  > = (props) => {
    const { id, data } = props ?? {}

    return disciplinasControllerUpdate(id, data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type DisciplinasControllerUpdateMutationResult = NonNullable<
  Awaited<ReturnType<typeof disciplinasControllerUpdate>>
>
export type DisciplinasControllerUpdateMutationBody =
  BodyType<UpdateDisciplinaDto>
export type DisciplinasControllerUpdateMutationError = ErrorType<void>

/**
 * @summary Atualizar disciplina por ID
 */
export const useDisciplinasControllerUpdate = <
  TError = ErrorType<void>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof disciplinasControllerUpdate>>,
      TError,
      { id: string; data: BodyType<UpdateDisciplinaDto> },
      TContext
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof disciplinasControllerUpdate>>,
  TError,
  { id: string; data: BodyType<UpdateDisciplinaDto> },
  TContext
> => {
  const mutationOptions = getDisciplinasControllerUpdateMutationOptions(options)

  return useMutation(mutationOptions, queryClient)
}
/**
 * @summary Remover disciplina por ID
 */
export const disciplinasControllerRemove = (
  id: string,
  options?: SecondParameter<typeof orvalCustomInstance>,
) => {
  return orvalCustomInstance<void>(
    { url: `/disciplinas/${id}`, method: "DELETE" },
    options,
  )
}

export const getDisciplinasControllerRemoveMutationOptions = <
  TError = ErrorType<void>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof disciplinasControllerRemove>>,
    TError,
    { id: string },
    TContext
  >
  request?: SecondParameter<typeof orvalCustomInstance>
}): UseMutationOptions<
  Awaited<ReturnType<typeof disciplinasControllerRemove>>,
  TError,
  { id: string },
  TContext
> => {
  const mutationKey = ["disciplinasControllerRemove"]
  const { mutation: mutationOptions, request: requestOptions } =
    options ?
      (
        options.mutation &&
        "mutationKey" in options.mutation &&
        options.mutation.mutationKey
      ) ?
        options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof disciplinasControllerRemove>>,
    { id: string }
  > = (props) => {
    const { id } = props ?? {}

    return disciplinasControllerRemove(id, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type DisciplinasControllerRemoveMutationResult = NonNullable<
  Awaited<ReturnType<typeof disciplinasControllerRemove>>
>

export type DisciplinasControllerRemoveMutationError = ErrorType<void>

/**
 * @summary Remover disciplina por ID
 */
export const useDisciplinasControllerRemove = <
  TError = ErrorType<void>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof disciplinasControllerRemove>>,
      TError,
      { id: string },
      TContext
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof disciplinasControllerRemove>>,
  TError,
  { id: string },
  TContext
> => {
  const mutationOptions = getDisciplinasControllerRemoveMutationOptions(options)

  return useMutation(mutationOptions, queryClient)
}
/**
 * @summary Listar disciplinas das matrizes do coordenador logado
 */
export const disciplinasControllerFindDisciplinasDoCoordenador = (
  options?: SecondParameter<typeof orvalCustomInstance>,
  signal?: AbortSignal,
) => {
  return orvalCustomInstance<DisciplinaResponseDto[]>(
    { url: `/disciplinas/coordenador/minhas-disciplinas`, method: "GET", signal },
    options,
  )
}

export const getDisciplinasControllerFindDisciplinasDoCoordenadorQueryKey =
  () => {
    return ["disciplinas", "coordenador", "minhas-disciplinas"] as const
  }

export const getDisciplinasControllerFindDisciplinasDoCoordenadorQueryOptions = <
  TData = Awaited<
    ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
  >,
  TError = ErrorType<void>,
>(options?: {
  query?: Partial<
    UseQueryOptions<
      Awaited<
        ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
      >,
      TError,
      TData
    >
  >
  request?: SecondParameter<typeof orvalCustomInstance>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey =
    queryOptions?.queryKey ??
    getDisciplinasControllerFindDisciplinasDoCoordenadorQueryKey()

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>>
  > = ({ signal }) =>
    disciplinasControllerFindDisciplinasDoCoordenador(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type DisciplinasControllerFindDisciplinasDoCoordenadorQueryResult =
  NonNullable<
    Awaited<ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>>
  >
export type DisciplinasControllerFindDisciplinasDoCoordenadorQueryError =
  ErrorType<void>

export function useDisciplinasControllerFindDisciplinasDoCoordenador<
  TData = Awaited<
    ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
  >,
  TError = ErrorType<void>,
>(
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<
          ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
        >,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<
            ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
          >,
          TError,
          Awaited<
            ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
          >
        >,
        "initialData"
      >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
}
export function useDisciplinasControllerFindDisciplinasDoCoordenador<
  TData = Awaited<
    ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
  >,
  TError = ErrorType<void>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<
          ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
        >,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<
            ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
          >,
          TError,
          Awaited<
            ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
          >
        >,
        "initialData"
      >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useDisciplinasControllerFindDisciplinasDoCoordenador<
  TData = Awaited<
    ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
  >,
  TError = ErrorType<void>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<
          ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
        >,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Listar disciplinas das matrizes do coordenador logado
 */

export function useDisciplinasControllerFindDisciplinasDoCoordenador<
  TData = Awaited<
    ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
  >,
  TError = ErrorType<void>,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<
          ReturnType<typeof disciplinasControllerFindDisciplinasDoCoordenador>
        >,
        TError,
        TData
      >
    >
    request?: SecondParameter<typeof orvalCustomInstance>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData, TError>
} {
  const queryOptions =
    getDisciplinasControllerFindDisciplinasDoCoordenadorQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<
    TData,
    TError
  > & { queryKey: DataTag<QueryKey, TData, TError> }

  query.queryKey = queryOptions.queryKey

  return query
}
