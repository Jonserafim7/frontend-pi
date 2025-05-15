import axios, { type InternalAxiosRequestConfig } from "axios"

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api" // Fallback para desenvolvimento

export const apiClient = axios.create({
  baseURL: apiBaseURL,
})

// Interceptor de Request: Adicionar token JWT ao header Authorization
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Em uma aplicação real, o token viria de um estado global (Context API, Zustand, Redux) ou localStorage
    const token = localStorage.getItem("authToken") // Exemplo: buscando token do localStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de Response (Opcional, mas recomendado)
// apiClient.interceptors.response.use(
//   (response) => {
//     // Qualquer código de status que esteja dentro do range de 2xx faz com que esta função seja acionada
//     return response;
//   },
//   (error) => {
//     // Qualquer código de status que caia fora do range de 2xx faz com que esta função seja acionada
//     if (error.response && error.response.status === 401) {
//       // Exemplo: Redirecionar para login se receber 401 Unauthorized
//       // localStorage.removeItem('authToken');
//       // window.location.href = '/login';
//       console.error('Unauthorized access - 401. Redirecting to login might be needed.');
//     }
//     return Promise.reject(error);
//   },
// );

export default apiClient
