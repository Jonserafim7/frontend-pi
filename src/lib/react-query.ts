import { QueryClient } from "@tanstack/react-query"

// Configurações padrão para as queries
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false, // Opcional: desabilitar refetch ao focar na janela
    retry: 1, // Opcional: número de tentativas em caso de erro
  },
}

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
})
