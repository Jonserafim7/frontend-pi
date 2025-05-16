import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react"
import { Link } from "react-router"

type StatCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  to: string
}

function StatCard({ title, value, icon, description, to }: StatCardProps) {
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
          <div className="mb-1.5 text-3xl font-bold">{value}</div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export function AdminDashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de administração do sistema acadêmico
          </p>
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
          title="Total de Cursos"
          value="12"
          icon={<GraduationCap className="h-4 w-4" />}
          description="+2 em relação ao mês passado"
          to="/admin/cursos"
        />
        <StatCard
          title="Professores"
          value="45"
          icon={<Users className="h-4 w-4" />}
          description="+5 este semestre"
          to="/admin/professores"
        />
        <StatCard
          title="Turmas Ativas"
          value="36"
          icon={<FileText className="h-4 w-4" />}
          description="5 turmas em andamento"
          to="/admin/turmas"
        />
        <StatCard
          title="Horários Gerados"
          value="24/36"
          icon={<Clock className="h-4 w-4" />}
          description="66% concluído"
          to="/admin/horarios"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Distribuição de turmas por curso no semestre atual
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="bg-muted/30 flex h-[300px] items-center justify-center rounded-lg">
              <BarChart className="text-muted-foreground/30 h-12 w-12" />
              <p className="text-muted-foreground/50 text-sm">
                Gráfico de distribuição
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: "Novo curso adicionado",
                  description: "Sistemas de Informação",
                  time: "Há 2 horas",
                },
                {
                  id: 2,
                  title: "Professor atualizado",
                  description: "João Silva",
                  time: "Hoje às 10:30",
                },
                {
                  id: 3,
                  title: "Horário gerado",
                  description: "Período 2024.1",
                  time: "Ontem",
                },
              ].map((activity) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
