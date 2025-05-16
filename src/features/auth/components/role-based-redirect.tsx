import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/auth-context"

/**
 * Componente que redireciona o usuário para a página inicial correta com base no seu papel (role)
 */
export function RoleBasedRedirect() {
  const { isAuthenticated, isAdmin, isDiretor, isCoordenador, isProfessor } =
    useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        navigate("/admin", { replace: true })
      } else if (isDiretor()) {
        navigate("/diretor", { replace: true })
      } else if (isCoordenador()) {
        navigate("/coordenador", { replace: true })
      } else if (isProfessor()) {
        navigate("/professor", { replace: true })
      }
      // Se o usuário não tiver nenhum dos papéis acima, permanecerá na página raiz
    }
  }, [isAuthenticated, isAdmin, isDiretor, isCoordenador, isProfessor, navigate])

  // Renderiza um loading enquanto o redirecionamento ocorre
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
        <p>Redirecionando...</p>
      </div>
    </div>
  )
}
