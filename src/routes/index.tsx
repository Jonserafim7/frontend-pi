import React from "react"
import { Route, Routes } from "react-router"
import { LoginPage } from "../features/auth/pages/login-page"
import ProtectedRoutes from "./ProtectedRoutes"
import PublicRoutes from "./PublicRoutes"

// Temporary placeholder component for protected pages
const DashboardPlaceholder = (): React.ReactElement => <div className="p-8">Dashboard page (coming soon)</div>

/**
 * Main application routes configuration
 */
export function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        {/* Use AppLayout when it's ready */}
        <Route>
          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          {/* Add more protected routes here */}
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">404</h1>
              <p>Página não encontrada</p>
            </div>
          </div>
        }
      />
    </Routes>
  )
}
