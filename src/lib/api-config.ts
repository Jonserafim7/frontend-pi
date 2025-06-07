/**
 * Configurações centralizadas da API
 */

/**
 * URLs base da API
 */
export const API_CONFIG = {
  // URL base da API - usa variável de ambiente ou fallback para desenvolvimento
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",

  // Timeout padrão para requisições (em ms)
  TIMEOUT: 30000, // 30 segundos

  // Configurações de retry
  RETRY: {
    attempts: 3,
    delay: 1000, // 1 segundo
    backoff: 2, // Multiplicador para delay exponencial
  },

  // Headers padrão
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const

/**
 * Endpoints da API
 */
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },

  // Usuários
  USERS: {
    BASE: "/usuarios",
    PROFILE: "/usuarios/profile",
  },

  // Cursos
  COURSES: {
    BASE: "/cursos",
    COORDENADOR: "/cursos/coordenador/meus-cursos",
  },

  // Períodos Letivos
  PERIODS: {
    BASE: "/periodos-letivos",
    ACTIVE: "/periodos-letivos/ativo",
  },

  // Propostas de Horário
  PROPOSALS: {
    BASE: "/propostas-horario",
    MINHAS: "/propostas-horario/minhas",
    DRAFT_ATIVA: "/propostas-horario/draft-ativa",
    ENVIAR: (id: string) => `/propostas-horario/${id}/enviar`,
    APROVAR: (id: string) => `/propostas-horario/${id}/aprovar`,
    REJEITAR: (id: string) => `/propostas-horario/${id}/rejeitar`,
    COMPLETUDE: (id: string) => `/propostas-horario/${id}/completude`,
  },

  // Disciplinas
  DISCIPLINES: {
    BASE: "/disciplinas",
  },

  // Disciplinas Ofertadas
  OFFERED_DISCIPLINES: {
    BASE: "/disciplinas-ofertadas",
  },

  // Turmas
  CLASSES: {
    BASE: "/turmas",
  },

  // Matrizes Curriculares
  CURRICULUM: {
    BASE: "/matrizes-curriculares",
  },

  // Disponibilidade de Professores
  AVAILABILITY: {
    BASE: "/disponibilidade-professores",
  },

  // Configurações de Horário
  SCHEDULE_CONFIG: {
    BASE: "/configuracoes-horario",
  },

  // Alocações de Horário
  ALLOCATIONS: {
    BASE: "/alocacoes-horarios",
  },
} as const

/**
 * Status codes da API
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
} as const

/**
 * Configurações de cache para React Query
 */
export const CACHE_CONFIG = {
  // Tempos de stale (dados considerados "velhos")
  STALE_TIME: {
    SHORT: 30 * 1000, // 30 segundos - dados que mudam frequentemente
    MEDIUM: 5 * 60 * 1000, // 5 minutos - dados que mudam ocasionalmente
    LONG: 15 * 60 * 1000, // 15 minutos - dados que mudam raramente
    VERY_LONG: 60 * 60 * 1000, // 1 hora - dados quase estáticos
  },

  // Tempos de garbage collection
  GC_TIME: {
    SHORT: 5 * 60 * 1000, // 5 minutos
    MEDIUM: 15 * 60 * 1000, // 15 minutos
    LONG: 30 * 60 * 1000, // 30 minutos
    VERY_LONG: 60 * 60 * 1000, // 1 hora
  },

  // Configurações de refetch
  REFETCH: {
    ON_WINDOW_FOCUS: true,
    ON_RECONNECT: true,
    RETRY_ON_MOUNT: true,
  },
} as const

/**
 * Configurações específicas por tipo de dados
 */
export const DATA_CONFIG = {
  // Propostas de horário
  PROPOSALS: {
    staleTime: CACHE_CONFIG.STALE_TIME.SHORT, // Mudam frequentemente
    gcTime: CACHE_CONFIG.GC_TIME.MEDIUM,
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  },

  // Períodos letivos
  PERIODS: {
    staleTime: CACHE_CONFIG.STALE_TIME.LONG, // Mudam raramente
    gcTime: CACHE_CONFIG.GC_TIME.LONG,
  },

  // Cursos
  COURSES: {
    staleTime: CACHE_CONFIG.STALE_TIME.LONG, // Mudam raramente
    gcTime: CACHE_CONFIG.GC_TIME.LONG,
  },

  // Usuários
  USERS: {
    staleTime: CACHE_CONFIG.STALE_TIME.MEDIUM, // Mudam ocasionalmente
    gcTime: CACHE_CONFIG.GC_TIME.MEDIUM,
  },

  // Disciplinas
  DISCIPLINES: {
    staleTime: CACHE_CONFIG.STALE_TIME.VERY_LONG, // Quase estáticas
    gcTime: CACHE_CONFIG.GC_TIME.VERY_LONG,
  },

  // Configurações
  CONFIG: {
    staleTime: CACHE_CONFIG.STALE_TIME.VERY_LONG, // Quase estáticas
    gcTime: CACHE_CONFIG.GC_TIME.VERY_LONG,
  },
} as const

/**
 * Utilitários para construção de URLs
 */
export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, string | number>,
): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }

  return url
}

/**
 * Utilitário para validar se a API está configurada corretamente
 */
export const validateApiConfig = (): boolean => {
  if (!API_CONFIG.BASE_URL) {
    console.error("❌ API_CONFIG.BASE_URL não está configurada")
    return false
  }

  try {
    new URL(API_CONFIG.BASE_URL)
  } catch {
    console.error(
      "❌ API_CONFIG.BASE_URL não é uma URL válida:",
      API_CONFIG.BASE_URL,
    )
    return false
  }

  console.log("✅ Configuração da API validada:", {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
  })

  return true
}

/**
 * Configurações de desenvolvimento
 */
export const DEV_CONFIG = {
  // Logs detalhados em desenvolvimento
  ENABLE_LOGS: import.meta.env.DEV,

  // Mock de dados em desenvolvimento
  ENABLE_MOCKS: import.meta.env.VITE_ENABLE_MOCKS === "true",

  // Delay artificial para simular latência
  MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY || "500", 10),
} as const

/**
 * Configurações de produção
 */
export const PROD_CONFIG = {
  // Logs mínimos em produção
  ENABLE_LOGS: false,

  // Sem mocks em produção
  ENABLE_MOCKS: false,

  // Sem delay artificial
  MOCK_DELAY: 0,
} as const

/**
 * Configuração ativa baseada no ambiente
 */
export const ACTIVE_CONFIG = import.meta.env.PROD ? PROD_CONFIG : DEV_CONFIG
