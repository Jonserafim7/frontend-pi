import type { AxiosError } from "axios"
import { toast } from "sonner"

/**
 * Tipos de erro da API
 */
export enum ApiErrorType {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  SERVER_ERROR = 500,
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

/**
 * Estrutura do erro retornado pela API
 */
export interface ApiErrorResponse {
  message: string
  error?: string
  statusCode?: number
  details?: Record<string, any>
  timestamp?: string
  path?: string
}

/**
 * Erro personalizado para operações da API
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType
  public readonly statusCode?: number
  public readonly details?: Record<string, any>
  public readonly originalError?: AxiosError

  constructor(
    message: string,
    type: ApiErrorType,
    statusCode?: number,
    details?: Record<string, any>,
    originalError?: AxiosError,
  ) {
    super(message)
    this.name = "ApiError"
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.originalError = originalError
  }

  public isNetworkError(): boolean {
    return this.type === ApiErrorType.NETWORK_ERROR
  }

  public isServerError(): boolean {
    return this.statusCode ? this.statusCode >= 500 : false
  }

  public isClientError(): boolean {
    return this.statusCode ?
        this.statusCode >= 400 && this.statusCode < 500
      : false
  }
}

/**
 * Mapeamento de códigos de status para tipos de erro
 */
const statusCodeToErrorType = {
  [ApiErrorType.UNAUTHORIZED]: ApiErrorType.UNAUTHORIZED,
  [ApiErrorType.FORBIDDEN]: ApiErrorType.FORBIDDEN,
  [ApiErrorType.NOT_FOUND]: ApiErrorType.NOT_FOUND,
  [ApiErrorType.VALIDATION_ERROR]: ApiErrorType.VALIDATION_ERROR,
  [ApiErrorType.SERVER_ERROR]: ApiErrorType.SERVER_ERROR,
} as const

/**
 * Mensagens padrão para tipos de erro
 */
const defaultErrorMessages = {
  [ApiErrorType.UNAUTHORIZED]: "Credenciais inválidas ou sessão expirada",
  [ApiErrorType.FORBIDDEN]: "Você não tem permissão para realizar esta ação",
  [ApiErrorType.NOT_FOUND]: "Recurso não encontrado",
  [ApiErrorType.VALIDATION_ERROR]: "Dados inválidos fornecidos",
  [ApiErrorType.SERVER_ERROR]: "Erro interno do servidor. Tente novamente",
  [ApiErrorType.NETWORK_ERROR]: "Erro de conexão. Verifique sua internet",
  [ApiErrorType.TIMEOUT]: "Operação expirou. Tente novamente",
  [ApiErrorType.UNKNOWN]: "Erro inesperado. Tente novamente",
} as const

/**
 * Converte um AxiosError em um ApiError estruturado
 */
export function handleApiError(error: unknown): ApiError {
  // Se já é um ApiError, retorna como está
  if (error instanceof ApiError) {
    return error
  }

  // Se não é um AxiosError, trata como erro desconhecido
  if (!error || typeof error !== "object" || !("isAxiosError" in error)) {
    return new ApiError(
      defaultErrorMessages[ApiErrorType.UNKNOWN],
      ApiErrorType.UNKNOWN,
      undefined,
      undefined,
      undefined,
    )
  }

  const axiosError = error as AxiosError<ApiErrorResponse>

  // Erro de rede (sem resposta do servidor)
  if (!axiosError.response) {
    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message.includes("timeout")
    ) {
      return new ApiError(
        defaultErrorMessages[ApiErrorType.TIMEOUT],
        ApiErrorType.TIMEOUT,
        undefined,
        undefined,
        axiosError,
      )
    }

    return new ApiError(
      defaultErrorMessages[ApiErrorType.NETWORK_ERROR],
      ApiErrorType.NETWORK_ERROR,
      undefined,
      undefined,
      axiosError,
    )
  }

  const { status, data } = axiosError.response
  const errorType =
    statusCodeToErrorType[status as keyof typeof statusCodeToErrorType] ||
    (status >= 500 ? ApiErrorType.SERVER_ERROR : ApiErrorType.UNKNOWN)

  // Extrai mensagem do erro
  let message: string = defaultErrorMessages[errorType]

  if (data?.message && typeof data.message === "string") {
    message = data.message
  } else if (typeof data === "string") {
    message = data
  }

  // Detalhes adicionais para debugging
  const details = {
    path: data?.path,
    timestamp: data?.timestamp,
    originalMessage: data?.error,
    ...data?.details,
  }

  return new ApiError(message, errorType, status, details, axiosError)
}

/**
 * Configurações para exibição de toasts de erro
 */
export interface ErrorToastOptions {
  /** Se deve mostrar toast automaticamente */
  showToast?: boolean
  /** Título customizado do toast */
  title?: string
  /** Descrição customizada do toast */
  description?: string
  /** Se deve incluir detalhes técnicos no toast */
  includeDetails?: boolean
  /** Duração do toast em ms */
  duration?: number
}

/**
 * Exibe um toast de erro baseado no ApiError
 */
export function showApiErrorToast(
  error: ApiError,
  options: ErrorToastOptions = {},
): void {
  const {
    showToast = true,
    title,
    description,
    includeDetails = false,
    duration = 5000,
  } = options

  if (!showToast) return

  const errorTitle = title || "Ops! Algo deu errado"
  const errorDescription = description || error.message

  // Adiciona detalhes técnicos se solicitado
  let finalDescription = errorDescription
  if (includeDetails && error.details) {
    const detailsText = Object.entries(error.details)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")

    if (detailsText) {
      finalDescription += ` (${detailsText})`
    }
  }

  // Escolhe o tipo de toast baseado no tipo de erro
  switch (error.type) {
    case ApiErrorType.UNAUTHORIZED:
    case ApiErrorType.FORBIDDEN:
      toast.error(errorTitle, {
        description: finalDescription,
        duration,
      })
      break

    case ApiErrorType.VALIDATION_ERROR:
      toast.warning(errorTitle, {
        description: finalDescription,
        duration,
      })
      break

    case ApiErrorType.NETWORK_ERROR:
    case ApiErrorType.TIMEOUT:
      toast.error(errorTitle, {
        description: finalDescription,
        duration: 8000, // Mais tempo para erros de rede
        action: {
          label: "Tentar novamente",
          onClick: () => window.location.reload(),
        },
      })
      break

    default:
      toast.error(errorTitle, {
        description: finalDescription,
        duration,
      })
  }
}

/**
 * Hook helper para tratamento consistente de erros da API
 */
export function useApiErrorHandler() {
  const handleError = (error: unknown, options?: ErrorToastOptions) => {
    const apiError = handleApiError(error)
    showApiErrorToast(apiError, options)
    return apiError
  }

  return { handleError }
}

/**
 * Utilitário para criar validações de resposta da API
 */
export function validateApiResponse<T>(response: T): T {
  if (!response) {
    throw new ApiError(
      "Resposta vazia do servidor",
      ApiErrorType.SERVER_ERROR,
      500,
    )
  }

  return response
}

/**
 * Wrapper para operações da API com tratamento de erro automático
 */
export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  options: ErrorToastOptions = {},
): Promise<T> {
  try {
    const result = await operation()
    return validateApiResponse(result)
  } catch (error) {
    const apiError = handleApiError(error)
    showApiErrorToast(apiError, options)
    throw apiError
  }
}
