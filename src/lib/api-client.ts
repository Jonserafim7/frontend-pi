import axios, { type InternalAxiosRequestConfig } from "axios"
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../features/auth/contexts/auth-context"

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000" // Fallback para desenvolvimento

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor de Request: Adicionar token JWT ao header Authorization
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * Interceptor de Response
 * Trata respostas de erro, especialmente para tokens expirados (401 Unauthorized)
 */
apiClient.interceptors.response.use(
  (response) => {
    // Qualquer código de status que esteja dentro do range de 2xx faz com que esta função seja acionada
    return response;
  },
  (error) => {
    // Qualquer código de status que caia fora do range de 2xx faz com que esta função seja acionada
    if (error.response && error.response.status === 401) {
      // Verifica se a requisição NÃO é para o endpoint de login
      // Ignoramos erros 401 na rota de login para não causar redirecionamentos em loop
      const isLoginRequest = error.config.url && 
        (error.config.url.endsWith('/auth/login') || 
         error.config.url.endsWith('/auth/signin'));
      
      if (!isLoginRequest) {
        // Token expirado ou inválido - desloga o usuário
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        
        // Redireciona para a página de login
        window.location.href = '/login';
        console.error('Token expirado ou inválido. Usuário foi deslogado automaticamente.');
      } else {
        console.error('Falha de autenticação: Credenciais inválidas.');
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient
