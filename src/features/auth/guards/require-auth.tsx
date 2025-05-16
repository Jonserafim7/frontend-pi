import { Navigate, useLocation } from "react-router"
import { UsuarioResponseDtoPapel } from "@/api-generated/model/usuario-response-dto-papel"
import { useAuth } from "../contexts/auth-context"
import type { ReactNode } from "react"

/**
 * Props para o componente RequireAuth
 */
interface RequireAuthProps {
  /**
   * Componente filho que será renderizado caso o usuário tenha permissão
   */
  children: ReactNode

  /**
   * Lista de papéis permitidos para acessar o recurso
   * Se não informado, qualquer usuário autenticado pode acessar
   */
  allowedRoles?: UsuarioResponseDtoPapel[]
}

/**
 * Componente que verifica se o usuário está autenticado e se possui o papel necessário
 * para acessar uma determinada rota. Caso contrário, redireciona para a página de login
 * ou para a página de não autorizado.
 *
 * @example
 * ```tsx
 * <Route
 *   path="/admin"
 *   element={
 *     <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
 *       <AdminPage />
 *     </RequireAuth>
 *   }
 * />
 * ```
 */
export const RequireAuth = ({ children, allowedRoles }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Se há papéis permitidos definidos e o usuário não tem um dos papéis requeridos
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    user?.papel &&
    !allowedRoles.includes(user.papel)
  ) {
    return (
      <Navigate
        to="/nao-autorizado"
        replace
      />
    )
  }

  // Se o usuário está autenticado e tem um dos papéis permitidos (ou se não há restrição de papel)
  return <>{children}</>
}
