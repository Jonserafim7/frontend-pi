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
}

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode
}

// Storage keys for persisting auth state
const AUTH_TOKEN_KEY = "auth-token"
const AUTH_USER_KEY = "auth-user"

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication provider component
 * Manages authentication state and provides login/logout functionality
 */
export const AuthProvider = ({ children }: AuthProviderProps): React.ReactElement => {
  const [user, setUser] = useState<AuthResponseDto["usuario"] | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const signInMutation = useAuthControllerSignIn()
  const navigate = useNavigate()

  // Check for existing authentication on component mount
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
        console.error("Error loading authentication data:", error)
        // Clear invalid storage data
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(AUTH_USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  /**
   * Authenticates user with email and password
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

        // Store auth data in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario))

        // Update state
        setAccessToken(token)
        setUser(usuario)

        // Navigate to dashboard after successful login
        navigate("/dashboard")
      } catch (error) {
        console.error("Login error:", error)
        setError("Invalid credentials. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [signInMutation, navigate]
  )

  /**
   * Logs out the user by clearing auth state and storage
   */
  const logout = useCallback((): void => {
    // Clear storage
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)

    // Reset state
    setAccessToken(null)
    setUser(null)

    // Redirect to login page
    navigate("/login")
  }, [navigate])

  /**
   * Verifica se o usuário tem um determinado papel
   */
  const hasRole = useCallback(
    (role: UsuarioResponseDtoPapel): boolean => {
      return !!user && user.papel === role
    },
    [user]
  )

  /**
   * Verifica se o usuário tem pelo menos um dos papéis especificados
   */
  const hasAnyRole = useCallback(
    (roles: UsuarioResponseDtoPapel[]): boolean => {
      return !!user && !!user.papel && roles.includes(user.papel)
    },
    [user]
  )

  /**
   * Retorna o papel do usuário atual ou null se não autenticado
   */
  const userRole = user?.papel || null

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
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access the authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
