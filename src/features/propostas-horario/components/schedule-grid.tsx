import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import { useAlocacoesHorariosControllerFindMany } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { useMemo } from "react"
import { TurnoSection } from "./turno-section"
import type { ScheduleGridProps } from "./schedule-grid-types"

/**
 * Componente da grade de horários que exibe a estrutura visual
 * baseada na configuração de horários do sistema
 */
export function ScheduleGrid({ className, propostaId }: ScheduleGridProps) {
  const {
    data: configuracao,
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = useConfiguracoesHorarioControllerGet()

  // Buscar todas as alocações existentes
  const {
    data: alocacoes,
    isLoading: isLoadingAlocacoes,
    error: errorAlocacoes,
  } = useAlocacoesHorariosControllerFindMany({})

  // Criar um mapa otimizado para busca rápida de alocações
  const alocacoesMap = useMemo(() => {
    if (!alocacoes) {
      return new Map()
    }

    const map = new Map<string, AlocacaoHorarioResponseDto[]>()
    alocacoes.forEach((alocacao) => {
      // Criar chave única: diaDaSemana_horaInicio
      const key = `${alocacao.diaDaSemana}_${alocacao.horaInicio}`

      // Se já existe uma entrada para esta chave, adiciona à lista
      if (map.has(key)) {
        map.get(key)!.push(alocacao)
      } else {
        // Senão, cria uma nova lista com esta alocação
        map.set(key, [alocacao])
      }
    })

    return map
  }, [alocacoes])

  const isLoading = isLoadingConfig || isLoadingAlocacoes
  const error = errorConfig || errorAlocacoes

  // Debug: Log da configuração quando ela carrega
  if (configuracao) {
    console.log(`⚙️ Configuração carregada:`, configuracao)
    console.log(`🌅 Turno Manhã - Aulas:`, configuracao.aulasTurnoManha)
    console.log(`🌞 Turno Tarde - Aulas:`, configuracao.aulasTurnoTarde)
    console.log(`🌙 Turno Noite - Aulas:`, configuracao.aulasTurnoNoite)
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-5 w-32" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton
                        key={j}
                        className="h-20"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !configuracao) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                {error ?
                  "Erro ao carregar dados de horários"
                : "Nenhuma configuração encontrada"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Grade de Horários
            {alocacoes && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {alocacoes.length} alocação{alocacoes.length !== 1 ? "ões" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Turno da Manhã */}
          <TurnoSection
            titulo="Manhã"
            aulas={configuracao.aulasTurnoManha}
            inicio={configuracao.inicioTurnoManha}
            fim={configuracao.fimTurnoManhaCalculado}
            alocacoesMap={alocacoesMap}
            propostaId={propostaId}
            todasAlocacoes={alocacoes || []}
          />

          {/* Turno da Tarde */}
          <TurnoSection
            titulo="Tarde"
            aulas={configuracao.aulasTurnoTarde}
            inicio={configuracao.inicioTurnoTarde}
            fim={configuracao.fimTurnoTardeCalculado}
            alocacoesMap={alocacoesMap}
            propostaId={propostaId}
            todasAlocacoes={alocacoes || []}
          />

          {/* Turno da Noite */}
          <TurnoSection
            titulo="Noite"
            aulas={configuracao.aulasTurnoNoite}
            inicio={configuracao.inicioTurnoNoite}
            fim={configuracao.fimTurnoNoiteCalculado}
            alocacoesMap={alocacoesMap}
            propostaId={propostaId}
            todasAlocacoes={alocacoes || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
