import { Navigate, Outlet } from "react-router"
import { useAuth } from "../features/auth/contexts/auth-context"

/**
 * Protected routes component
 * Ensures only authenticated users can access protected routes
 */
const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()

  // Show nothing while checking authentication status
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  // Render the child route content if user is authenticated
  return <Outlet />
}

export default ProtectedRoutes
