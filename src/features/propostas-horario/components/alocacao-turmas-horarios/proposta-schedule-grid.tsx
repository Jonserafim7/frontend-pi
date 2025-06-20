import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import { useAlocacoesHorariosControllerFindByProposta } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { PropostaScheduleGridProps } from "../../types/proposta-allocation-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Eye, Edit } from "lucide-react"
import { PropostaTurnoSection } from "./proposta-turno-section"

/**
 * Componente da grade de horários específico para uma proposta
 * Exibe apenas as alocações que pertencem à proposta especificada
 */
export function PropostaScheduleGrid({
  propostaId,
  className,
  readonly = false,
}: PropostaScheduleGridProps) {
  const {
    data: configuracao,
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = useConfiguracoesHorarioControllerGet()

  // Buscar alocações específicas da proposta
  const {
    data: alocacoes,
    isLoading: isLoadingAlocacoes,
    error: errorAlocacoes,
  } = useAlocacoesHorariosControllerFindByProposta(propostaId, {
    query: {
      enabled: !!propostaId,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  })

  const isLoading = isLoadingConfig || isLoadingAlocacoes
  const error = errorConfig || errorAlocacoes

  // Debug: Log da configuração quando ela carrega
  if (configuracao) {
    console.log(
      `⚙️ Configuração carregada para proposta ${propostaId}:`,
      configuracao,
    )
    console.log(`📋 Alocações da proposta:`, alocacoes?.length || 0)
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
            Grade de Horários da Proposta
            {alocacoes && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {alocacoes.length} alocação{alocacoes.length !== 1 ? "ões" : ""}
              </Badge>
            )}
            {readonly && (
              <Badge
                variant="outline"
                className="text-muted-foreground gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                Visualização
              </Badge>
            )}
            {!readonly && (
              <Badge variant="outline">
                <Edit className="h-3 w-3" />
                Editável
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Turno da Manhã */}
          <PropostaTurnoSection
            titulo="Manhã"
            aulas={configuracao.aulasTurnoManha}
            inicio={configuracao.inicioTurnoManha}
            fim={configuracao.fimTurnoManhaCalculado}
            propostaId={propostaId}
            readonly={readonly}
          />

          {/* Turno da Tarde */}
          <PropostaTurnoSection
            titulo="Tarde"
            aulas={configuracao.aulasTurnoTarde}
            inicio={configuracao.inicioTurnoTarde}
            fim={configuracao.fimTurnoTardeCalculado}
            propostaId={propostaId}
            readonly={readonly}
          />

          {/* Turno da Noite */}
          <PropostaTurnoSection
            titulo="Noite"
            aulas={configuracao.aulasTurnoNoite}
            inicio={configuracao.inicioTurnoNoite}
            fim={configuracao.fimTurnoNoiteCalculado}
            propostaId={propostaId}
            readonly={readonly}
          />
        </CardContent>
      </Card>
    </div>
  )
}
