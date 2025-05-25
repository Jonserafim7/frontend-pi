import { Route, Routes } from "react-router"
import { LoginPage } from "../features/auth/pages/login-page"
import { UnauthorizedPage } from "../features/auth/pages/unauthorized-page"
import { RequireAuth } from "../features/auth/guards/require-auth"
import { UsuarioResponseDtoPapel } from "../api-generated/model/usuario-response-dto-papel"
import { UserListPage } from "../features/users/pages"
import AppLayout from "../components/layout/app-layout"
import ProtectedRoutes from "./protected-routes"
import PublicRoutes from "./public-routes"
import { RoleBasedRedirect } from "@/features/auth/components/role-based-redirect"
import { Illustration, NotFoundPage } from "../pages/not-found-page"
import { AdminDashboard } from "@/features/admin/pages/admin-dashboard"
import { CoursesListPage } from "@/features/courses/pages/courses-list-page"
import { ConfiguracoesHorarioPage } from "@/features/configuracoes-horario/pages/configuracoes-horario-page"
import { DashboardDiretor } from "@/features/configuracoes-horario/pages/dashboard-diretor"
import { DiretorHelpPage } from "@/features/ajuda/pages/diretor-help-page"
import { MatrizesCurricularesListPage } from "@/features/matrizes-curriculares/pages/matrizes-curriculares-list-page"
import { MatrizCurricularDetailsPage } from "@/features/matrizes-curriculares/pages/matriz-curricular-details-page"
import { DisciplinasListPage } from "@/features/disciplinas/pages/disciplinas-list-page"
import { DisciplinasOfertadasListPage } from "@/features/disciplinas-ofertadas/pages/disciplinas-ofertadas-list-page"
import { PeriodosLetivosListPage } from "@/features/periodos-letivos/pages/periodos-letivos-list-page"
import {
  ProfessorDisponibilidadePage,
  CoordenadorDisponibilidadePage,
} from "@/features/disponibilidade-professores/pages"
import { TurmasListPage } from "@/features/turmas/pages/turmas-list-page"

// Placeholders genéricos para cada tipo de usuário
const CoordenadorDashboard = () => <div>Dashboard do Coordenador (em breve)</div>
const ProfessorDashboard = () => <div>Dashboard do Professor (em breve)</div>

/**
 * Main application routes configuration
 */
export function AppRoutes() {
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
        <Route element={<AppLayout />}>
          {/* Rota padrão que redireciona com base no papel do usuário */}
          <Route
            index
            element={<RoleBasedRedirect />}
          />

          {/* Rotas específicas por papel de usuário */}
          <Route path="/admin">
            <Route
              index
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.ADMIN]}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
          </Route>

          <Route path="/diretor">
            <Route
              index
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
                  <DashboardDiretor />
                </RequireAuth>
              }
            />
            <Route path="periodos-letivos">
              <Route
                index
                element={
                  <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
                    <PeriodosLetivosListPage />
                  </RequireAuth>
                }
              />
            </Route>
            <Route
              path="cursos"
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
                  <CoursesListPage />
                </RequireAuth>
              }
            />
            <Route
              path="configuracoes-horario"
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
                  <ConfiguracoesHorarioPage />
                </RequireAuth>
              }
            />
            <Route
              path="ajuda"
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.DIRETOR]}>
                  <DiretorHelpPage />
                </RequireAuth>
              }
            />
          </Route>

          <Route path="/coordenador">
            <Route
              index
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}>
                  <CoordenadorDashboard />
                </RequireAuth>
              }
            />
            <Route path="matrizes-curriculares">
              <Route
                index
                element={
                  <RequireAuth
                    allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}
                  >
                    <MatrizesCurricularesListPage />
                  </RequireAuth>
                }
              />
              <Route
                path=":id"
                element={
                  <RequireAuth
                    allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}
                  >
                    <MatrizCurricularDetailsPage />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="disciplinas">
              <Route
                index
                element={
                  <RequireAuth
                    allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}
                  >
                    <DisciplinasListPage />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="disciplinas-ofertadas">
              {" "}
              <Route
                index
                element={
                  <RequireAuth
                    allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}
                  >
                    {" "}
                    <DisciplinasOfertadasListPage />{" "}
                  </RequireAuth>
                }
              />{" "}
            </Route>{" "}
            <Route path="turmas">
              {" "}
              <Route
                index
                element={
                  <RequireAuth
                    allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}
                  >
                    {" "}
                    <TurmasListPage />{" "}
                  </RequireAuth>
                }
              />{" "}
            </Route>{" "}
            <Route path="disponibilidades">
              {" "}
              <Route
                index
                element={
                  <RequireAuth
                    allowedRoles={[UsuarioResponseDtoPapel.COORDENADOR]}
                  >
                    {" "}
                    <CoordenadorDisponibilidadePage />{" "}
                  </RequireAuth>
                }
              />{" "}
            </Route>
          </Route>

          <Route path="/professor">
            <Route
              index
              element={
                <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.PROFESSOR]}>
                  <ProfessorDashboard />
                </RequireAuth>
              }
            />

            <Route path="disponibilidades">
              <Route
                index
                element={
                  <RequireAuth allowedRoles={[UsuarioResponseDtoPapel.PROFESSOR]}>
                    <ProfessorDisponibilidadePage />
                  </RequireAuth>
                }
              />
            </Route>
          </Route>

          <Route
            path="usuarios"
            element={
              <RequireAuth
                allowedRoles={[
                  UsuarioResponseDtoPapel.ADMIN,
                  UsuarioResponseDtoPapel.DIRETOR,
                  UsuarioResponseDtoPapel.COORDENADOR,
                ]}
              >
                <UserListPage />
              </RequireAuth>
            }
          />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="bg-background relative flex min-h-svh w-full flex-col justify-center p-6 md:p-10">
            <div className="relative mx-auto w-full max-w-5xl">
              <Illustration className="text-foreground absolute inset-0 h-[50vh] w-full opacity-[0.04] dark:opacity-[0.03]" />
              <NotFoundPage
                title="Página não encontrada"
                description="Parece que você chegou em um lugar que não existe."
              />
            </div>
          </div>
        }
      />
    </Routes>
  )
}
