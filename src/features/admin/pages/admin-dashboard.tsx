import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar, Clock, FileText, GraduationCap, Users } from "lucide-react"
import { Link } from "react-router"
import { useUsuariosControllerFindAll } from "@/api-generated/client/usuarios/usuarios"
import { UsuarioResponseDtoPapel } from "@/api-generated/model/usuario-response-dto-papel"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderIconContainer } from "@/components/icon-container"
import { Shield } from "lucide-react"

type StatCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  to: string
  isLoading?: boolean
}

function StatCard({
  title,
  value,
  icon,
  description,
  to,
  isLoading,
}: StatCardProps) {
  return (
    <Link
      to={to}
      className="group block h-full"
    >
      <Card className="hover:border-primary/20 h-full transition-all duration-200 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground group-hover:text-primary text-lg font-medium transition-colors">
            {title}
          </CardTitle>
          <div className="bg-primary/10 text-primary rounded-lg p-2.5 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6">
          {isLoading ?
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          : <>
              <div className="mb-1.5 text-3xl font-bold">{value}</div>
              <p className="text-muted-foreground text-sm">{description}</p>
            </>
          }
        </CardContent>
      </Card>
    </Link>
  )
}

/**
 * Dashboard administrativo com dados reais do sistema
 * @component
 * @example
 * <AdminDashboard />
 *
 * @returns {JSX.Element} Dashboard com estatísticas e visão geral do sistema
 *
 * @since 1.0.0
 */
export function AdminDashboard() {
  const {
    data: usuarios = [],
    isPending: isLoadingUsuarios,
    isError: isErrorUsuarios,
  } = useUsuariosControllerFindAll()

  /**
   * Calcula estatísticas dos usuários por papel
   * @param usuarios - Lista de usuários do sistema
   * @returns Objeto com contadores por papel
   */
  const getUserStatistics = () => {
    if (!usuarios || usuarios.length === 0) {
      return {
        total: 0,
        admins: 0,
        diretores: 0,
        coordenadores: 0,
        professores: 0,
      }
    }

    return usuarios.reduce(
      (stats, usuario) => {
        stats.total++
        switch (usuario.papel) {
          case UsuarioResponseDtoPapel.ADMIN:
            stats.admins++
            break
          case UsuarioResponseDtoPapel.DIRETOR:
            stats.diretores++
            break
          case UsuarioResponseDtoPapel.COORDENADOR:
            stats.coordenadores++
            break
          case UsuarioResponseDtoPapel.PROFESSOR:
            stats.professores++
            break
        }
        return stats
      },
      {
        total: 0,
        admins: 0,
        diretores: 0,
        coordenadores: 0,
        professores: 0,
      },
    )
  }

  /**
   * Gera descrição baseada na quantidade e comparação com mês anterior
   * @param current - Valor atual
   * @param label - Rótulo do item
   * @returns Descrição formatada
   */
  const getDescriptionText = (current: number, label: string) => {
    if (current === 0) return `Nenhum ${label.toLowerCase()} cadastrado`
    if (current === 1) return `${current} ${label.toLowerCase()} ativo`
    return `${current} ${label.toLowerCase()}s ativos`
  }

  /**
   * Gera atividades recentes baseadas nos usuários mais recentes
   * @param usuarios - Lista de usuários
   * @returns Lista de atividades recentes
   */
  const getRecentActivities = () => {
    if (!usuarios || usuarios.length === 0) return []

    return usuarios
      .sort(
        (a, b) =>
          new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime(),
      )
      .slice(0, 3)
      .map((usuario, index) => {
        const daysDiff = Math.floor(
          (new Date().getTime() - new Date(usuario.dataCriacao).getTime()) /
            (1000 * 60 * 60 * 24),
        )

        let timeText = ""
        if (daysDiff === 0) {
          timeText = "Hoje"
        } else if (daysDiff === 1) {
          timeText = "Ontem"
        } else if (daysDiff < 7) {
          timeText = `Há ${daysDiff} dias`
        } else {
          timeText = new Date(usuario.dataCriacao).toLocaleDateString("pt-BR")
        }

        const roleName =
          {
            [UsuarioResponseDtoPapel.ADMIN]: "Administrador",
            [UsuarioResponseDtoPapel.DIRETOR]: "Diretor",
            [UsuarioResponseDtoPapel.COORDENADOR]: "Coordenador",
            [UsuarioResponseDtoPapel.PROFESSOR]: "Professor",
          }[usuario.papel] || "Usuário"

        return {
          id: index + 1,
          title: "Novo usuário cadastrado",
          description: `${usuario.nome} - ${roleName}`,
          time: timeText,
        }
      })
  }

  const stats = getUserStatistics()
  const recentActivities = getRecentActivities()

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={Shield} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Painel de Controle</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao painel de administração do sistema acadêmico
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-secondary text-secondary-foreground rounded-md p-2">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Data atual</p>
            <p className="font-medium">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Usuários"
          value={stats.total.toString()}
          icon={<Users className="h-4 w-4" />}
          description={getDescriptionText(stats.total, "usuário")}
          to="/usuarios"
          isLoading={isLoadingUsuarios}
        />
        <StatCard
          title="Professores"
          value={stats.professores.toString()}
          icon={<GraduationCap className="h-4 w-4" />}
          description={getDescriptionText(stats.professores, "professor")}
          to="/usuarios?papel=PROFESSOR"
          isLoading={isLoadingUsuarios}
        />
        <StatCard
          title="Coordenadores"
          value={stats.coordenadores.toString()}
          icon={<FileText className="h-4 w-4" />}
          description={getDescriptionText(stats.coordenadores, "coordenador")}
          to="/usuarios?papel=COORDENADOR"
          isLoading={isLoadingUsuarios}
        />
        <StatCard
          title="Administradores"
          value={`${stats.admins + stats.diretores}`}
          icon={<Clock className="h-4 w-4" />}
          description={getDescriptionText(
            stats.admins + stats.diretores,
            "administrador",
          )}
          to="/usuarios?papel=ADMIN"
          isLoading={isLoadingUsuarios}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
            <CardDescription>
              Distribuição de usuários por papel no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingUsuarios ?
              <div className="flex h-[300px] items-center justify-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            : isErrorUsuarios ?
              <div className="bg-muted/30 flex h-[300px] items-center justify-center rounded-lg">
                <p className="text-muted-foreground/50 text-sm">
                  Erro ao carregar dados
                </p>
              </div>
            : <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Professores</span>
                  <span className="text-muted-foreground text-sm">
                    {stats.professores}
                  </span>
                </div>
                <div className="bg-muted h-2 w-full rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${stats.total > 0 ? (stats.professores / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Coordenadores</span>
                  <span className="text-muted-foreground text-sm">
                    {stats.coordenadores}
                  </span>
                </div>
                <div className="bg-muted h-2 w-full rounded-full">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.coordenadores / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Administradores</span>
                  <span className="text-muted-foreground text-sm">
                    {stats.admins + stats.diretores}
                  </span>
                </div>
                <div className="bg-muted h-2 w-full rounded-full">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${stats.total > 0 ? ((stats.admins + stats.diretores) / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{stats.total}</span>
                  </div>
                </div>
              </div>
            }
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimos usuários cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsuarios ?
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3"
                  >
                    <Skeleton className="mt-2 h-2 w-2 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            : isErrorUsuarios ?
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground/50 text-sm">
                  Erro ao carregar atividades
                </p>
              </div>
            : recentActivities.length === 0 ?
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground/50 text-sm">
                  Nenhuma atividade recente
                </p>
              </div>
            : <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3"
                  >
                    <div className="bg-primary mt-2 h-2 w-2 rounded-full" />
                    <div>
                      <p className="text-sm leading-none font-medium">
                        {activity.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {activity.description}
                      </p>
                      <p className="text-muted-foreground/70 text-xs">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
