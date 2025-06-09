import { AlocacaoCard } from "./alocacao-card"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Mapeamento dos dias da semana para exibição
 */
const diasSemanaMap = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
} as const

/**
 * Ordem dos dias da semana
 */
const ordemDias = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
] as const

interface AlocacoesPorDiaProps {
  alocacoes: AlocacaoHorarioResponseDto[]
  isLoading?: boolean
}

/**
 * Componente para exibir alocações organizadas por dia da semana
 */
export function AlocacoesPorDia({
  alocacoes,
  isLoading = false,
}: AlocacoesPorDiaProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="bg-muted h-6 w-32 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="bg-muted h-48 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Agrupar alocações por dia da semana
  const alocacoesPorDia = alocacoes.reduce(
    (acc, alocacao) => {
      const dia = alocacao.diaDaSemana
      if (!acc[dia]) {
        acc[dia] = []
      }
      acc[dia].push(alocacao)
      return acc
    },
    {} as Record<string, AlocacaoHorarioResponseDto[]>,
  )

  // Ordenar alocações dentro de cada dia por horário
  Object.keys(alocacoesPorDia).forEach((dia) => {
    alocacoesPorDia[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  })

  // Filtrar apenas os dias que têm alocações e ordenar pela ordem dos dias da semana
  const diasComAlocacoes = ordemDias.filter(
    (dia) => alocacoesPorDia[dia]?.length > 0,
  )

  if (diasComAlocacoes.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-muted-foreground mb-2 text-lg">
          Nenhuma alocação encontrada
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {diasComAlocacoes.map((dia) => {
        const alocacoesDoDia = alocacoesPorDia[dia]
        const cargaHorariaDia = alocacoesDoDia.reduce((total, alocacao) => {
          const inicio = new Date(`1970-01-01T${alocacao.horaInicio}:00`)
          const fim = new Date(`1970-01-01T${alocacao.horaFim}:00`)
          const duracao = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
          return total + duracao
        }, 0)

        return (
          <Card
            key={dia}
            className="overflow-hidden"
          >
            <CardHeader className="bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {diasSemanaMap[dia as keyof typeof diasSemanaMap]}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {alocacoesDoDia.length} aula
                    {alocacoesDoDia.length !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="outline">{cargaHorariaDia.toFixed(1)}h</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {alocacoesDoDia.map((alocacao) => (
                  <AlocacaoCard
                    key={alocacao.id}
                    alocacao={alocacao}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Resumo total */}
      <div className="text-muted-foreground text-center text-sm">
        Total: {alocacoes.length} aula{alocacoes.length !== 1 ? "s" : ""} em{" "}
        {diasComAlocacoes.length} dia{diasComAlocacoes.length !== 1 ? "s" : ""} da
        semana
      </div>
    </div>
  )
}
