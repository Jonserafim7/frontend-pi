import { Calendar, Clock, BookOpen, GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AlocacoesStats } from "../hooks/use-minhas-alocacoes"

interface AlocacoesStatsProps {
  stats: AlocacoesStats
  isLoading?: boolean
}

/**
 * Componente para exibir estatísticas das alocações do professor
 */
export function AlocacoesStatsComponent({
  stats,
  isLoading = false,
}: AlocacoesStatsProps) {
  const { totalAlocacoes, disciplinasUnicas, diasAtivos, cargaHorariaSemanal } =
    stats

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="bg-muted h-4 w-20 animate-pulse rounded"></div>
              </CardTitle>
              <div className="bg-muted h-4 w-4 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-8 w-12 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Alocações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
          <Calendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAlocacoes}</div>
          <p className="text-muted-foreground text-xs">aulas alocadas</p>
        </CardContent>
      </Card>

      {/* Disciplinas Únicas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{disciplinasUnicas}</div>
          <p className="text-muted-foreground text-xs">disciplinas diferentes</p>
        </CardContent>
      </Card>

      {/* Dias Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dias da Semana</CardTitle>
          <GraduationCap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{diasAtivos}</div>
          <p className="text-muted-foreground text-xs">dias com aulas</p>
        </CardContent>
      </Card>

      {/* Carga Horária Semanal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carga Horária</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {cargaHorariaSemanal.toFixed(1)}h
          </div>
          <p className="text-muted-foreground text-xs">horas por semana</p>
        </CardContent>
      </Card>
    </div>
  )
}
