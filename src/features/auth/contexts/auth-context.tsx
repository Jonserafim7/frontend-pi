import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useNavigate } from "react-router"
import type { AuthResponseDto } from "@/api-generated/model"
import { UsuarioResponseDtoPapel } from "@/api-generated/model/usuario-response-dto-papel"
import { useAuthControllerSignIn } from "@/api-generated/client/auth/auth"
import { queryClient } from "@/lib/react-query"

/**
 * Interface representando o estado e métodos do contexto de autenticação
 */
interface AuthContextType {
  /** Usuário autenticado atual ou null se não autenticado */
  user: AuthResponseDto["usuario"] | null
  /** Token de acesso atual ou null se não autenticado */
  accessToken: string | null
  /** Indica se o usuário está autenticado */
  isAuthenticated: boolean
  /** Indica se uma operação de autenticação está em andamento */
  isLoading: boolean
  /** Mensagem de erro, se houver */
  error: string | null
  /** Função para realizar login */
  login: (email: string, password: string) => Promise<void>
  /** Função para realizar logout */
  logout: () => void
  /** Verifica se o usuário tem um determinado papel */
  hasRole: (role: UsuarioResponseDtoPapel) => boolean
  /** Verifica se o usuário tem pelo menos um dos papéis especificados */
  hasAnyRole: (roles: UsuarioResponseDtoPapel[]) => boolean
  /** Retorna o papel do usuário atual ou null se não autenticado */
  userRole: UsuarioResponseDtoPapel | null
  /** Verifica se o usuário é um administrador */
  isAdmin: () => boolean
  /** Verifica se o usuário é um diretor */
  isDiretor: () => boolean
  /** Verifica se o usuário é um coordenador */
  isCoordenador: () => boolean
  /** Verifica se o usuário é um professor */
  isProfessor: () => boolean
}

/**
 * Props para o componente AuthProvider
 */
interface AuthProviderProps {
  children: ReactNode
}

// Chaves de armazenamento para persistir estado de autenticação
export const AUTH_TOKEN_KEY = "auth-token"
export const AUTH_USER_KEY = "auth-user"

// Criar contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Componente provedor de autenticação
 * Gerencia estado de autenticação e fornece funcionalidades de login/logout
 */
export const AuthProvider = ({
  children,
}: AuthProviderProps): React.ReactElement => {
  const [user, setUser] = useState<AuthResponseDto["usuario"] | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const signInMutation = useAuthControllerSignIn()
  const navigate = useNavigate()

  // Verificar autenticação existente na montagem do componente
  useEffect(() => {
    const loadStoredAuth = (): void => {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
        const storedUser = localStorage.getItem(AUTH_USER_KEY)

        if (storedToken && storedUser) {
          setAccessToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error)
        // Limpar dados de armazenamento inválidos
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(AUTH_USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  /**
   * Autentica usuário com email e senha
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setError(null)
      try {
        setIsLoading(true)
        const response = await signInMutation.mutateAsync({
          data: { email, senha: password },
        })

        const { accessToken: token, usuario } = response

        // Armazenar dados de autenticação no localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario))

        setAccessToken(token)
        setUser(usuario)

        navigate("/")
      } catch (error) {
        console.error("Erro de login:", error)
        const errorMessage =
          (error as any)?.response?.data?.message ||
          "Credenciais inválidas. Verifique suas informações e tente novamente."
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [signInMutation, navigate],
  )

  /**
   * Faz logout do usuário limpando estado de autenticação e armazenamento
   */
  const logout = useCallback((): void => {
    // Limpar armazenamento
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)

    // Resetar estado
    setAccessToken(null)
    setUser(null)

    // Limpar cache do react query
    queryClient.clear()

    // Redirecionar para página de login
    navigate("/login")
  }, [navigate])

  /**
   * Verifica se o usuário tem um determinado papel
   */
  const hasRole = useCallback(
    (role: UsuarioResponseDtoPapel): boolean => {
      return !!user && user.papel === role
    },
    [user],
  )

  /**
   * Verifica se o usuário tem pelo menos um dos papéis especificados
   */
  const hasAnyRole = useCallback(
    (roles: UsuarioResponseDtoPapel[]): boolean => {
      return !!user && !!user.papel && roles.includes(user.papel)
    },
    [user],
  )

  /**
   * Retorna o papel do usuário atual ou null se não autenticado
   */
  const userRole = user?.papel || null

  /**
   * Verifica se o usuário é um administrador
   */
  const isAdmin = useCallback((): boolean => {
    return hasRole(UsuarioResponseDtoPapel.ADMIN)
  }, [hasRole])

  /**
   * Verifica se o usuário é um diretor
   */
  const isDiretor = useCallback((): boolean => {
    return hasRole(UsuarioResponseDtoPapel.DIRETOR)
  }, [hasRole])

  /**
   * Verifica se o usuário é um coordenador
   */
  const isCoordenador = useCallback((): boolean => {
    return hasRole(UsuarioResponseDtoPapel.COORDENADOR)
  }, [hasRole])

  /**
   * Verifica se o usuário é um professor
   */
  const isProfessor = useCallback((): boolean => {
    return hasRole(UsuarioResponseDtoPapel.PROFESSOR)
  }, [hasRole])

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    userRole,
    isAdmin,
    isDiretor,
    isCoordenador,
    isProfessor,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

/**
 * Hook customizado para acessar o contexto de autenticação
 * Deve ser usado dentro de um AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
