import React from "react"
import { Route, Routes } from "react-router"
import { LoginPage } from "../features/auth/pages/login-page"
import { UnauthorizedPage } from "../features/auth/pages/unauthorized-page"
import { RequireAuth } from "../features/auth/guards/require-auth"
import { UsuarioResponseDtoPapel } from "../api-generated/model/usuario-response-dto-papel"
import ProtectedRoutes from "./ProtectedRoutes"
import PublicRoutes from "./PublicRoutes"

// Temporary placeholder components for protected pages
const DashboardPlaceholder = (): React.ReactElement => (
  <div className="p-8">Dashboard page (coming soon)</div>
)

// Placeholders específicos para cada tipo de usuário
const DiretorDashboard = (): React.ReactElement => (
  <div className="bg-blue-50 p-8">Dashboard do Diretor (em breve)</div>
)
const CoordenadorDashboard = (): React.ReactElement => (
  <div className="bg-green-50 p-8">Dashboard do Coordenador (em breve)</div>
)
const ProfessorDashboard = (): React.ReactElement => (
  <div className="bg-yellow-50 p-8">Dashboard do Professor (em breve)</div>
)

/**
 * Main application routes configuration
 */
export function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoutes />}>
        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Route>

      {/* Rota para página de acesso não autorizado */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* Protected Routes - Verificação básica de autenticação */}
      <Route element={<ProtectedRoutes />}>
        {/* Rota padrão e dashboard genérico */}
        <Route
          path="/"
          element={<DashboardPlaceholder />}
        />
        <Route
          path="/dashboard"
          element={<DashboardPlaceholder />}
        />

        {/* Rotas específicas por papel de usuário */}
        <Route
          path="/diretor"
          element={
            <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
              <DiretorDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/coordenador"
          element={
            <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}>
              <CoordenadorDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/professor"
          element={
            <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.PROFESSOR]}>
              <ProfessorDashboard />
            </RequireAuth>
          }
        />

        {/* Adicionar mais rotas protegidas aqui */}
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold">404</h1>
              <p>Página não encontrada</p>
            </div>
          </div>
        }
      />
    </Routes>
  )
}
