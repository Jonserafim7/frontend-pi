import React from "react"
import { Navigate, Outlet } from "react-router"
import { useAuth } from "../features/auth/contexts/auth-context"

/**
 * Public routes component
 * Redirects authenticated users to the dashboard and allows unauthenticated users to access public routes
 */
const PublicRoutes = (): React.ReactElement => {
  const { isAuthenticated } = useAuth()

  // If user is already authenticated, redirect to dashboard when trying to access public routes like login
  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  // Render the child route content if user is not authenticated
  return <Outlet />
}

export default PublicRoutes
