import type { AxiosRequestConfig, AxiosError } from "axios"
import axios from "axios" // For CancelToken
import apiClient from "./api-client" // Your existing custom Axios instance

/**
 * Custom Axios instance function for Orval.
 * This function is called by Orval to make API requests. It uses the
 * pre-configured 'api' instance from './api.ts', ensuring that all
 * interceptors (like JWT token handling and base URL) are applied.
 *
 * @param config The AxiosRequestConfig provided by Orval for the request.
 * @param options Optional additional AxiosRequestConfig.
 * @returns A Promise that resolves to the data (T) from the API response.
 */
export const orvalCustomInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source()

  const promise = apiClient({
    // Use the imported 'api' instance
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data) // Orval typically expects the data directly

  // Attach the cancel method to the promise, which can be used by React Query
  // @ts-expect-error - This is a common pattern for cancellable promises
  promise.cancel = () => {
    source.cancel("Query was cancelled by Orval client.")
  }

  return promise
}

/**
 * Defines the error type that React Query hooks will expect.
 * Useful for type safety in error handling.
 */
export type ErrorType<Error> = AxiosError<Error>

/**
 * Defines the body type for requests.
 * Can be used to transform request bodies if needed, but here it's generic.
 */
export type BodyType<BodyData> = BodyData
