import { QueryClient } from "@tanstack/react-query"

// Configurações padrão para as queries
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false, // Opcional: desabilitar refetch ao focar na janela
    retry: 1, // Opcional: número de tentativas em caso de erro
  },
}

// Habilitar logs para facilitar o debugging das queries
const queryClientConfig = {
  defaultOptions: defaultQueryOptions,
}

// Adicionar console.log para visualizar as keys das queries quando inicializadas
if (import.meta.env.DEV) {
  // Apenas em ambiente de desenvolvimento
  console.log("Inicializando QueryClient com modo de debug ativado")
}

export const queryClient = new QueryClient(queryClientConfig)
