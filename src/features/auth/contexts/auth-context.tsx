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
import { useAuthControllerSignIn } from "@/api-generated/client/auth/auth"

/**
 * Interface representing authentication context state and methods
 */
interface AuthContextType {
  user: AuthResponseDto["usuario"] | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
    login,
    logout,
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
