import { cn } from "@/lib/utils"
import { Clock, ClockIcon, TimerIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"

/**
 * Props para o componente TurnoHorariosDetalhes
 */
interface TurnoHorariosDetalhesProps {
  turno: "manha" | "tarde" | "noite"
}

/**
 * Componente simplificado para exibir os detalhes dos horários de um turno específico
 */
export function TurnoHorariosDetalhes({ turno }: TurnoHorariosDetalhesProps) {
  const { data: configuracoesHorario } = useConfiguracoesHorarioControllerGet({})

  // Retorna se os dados ainda não foram carregados
  if (!configuracoesHorario) return null

  // Mapeamento de turnos para títulos e propriedades
  const turnoInfo = {
    manha: {
      titulo: "Manhã",
      inicioTurno: configuracoesHorario.inicioTurnoManha,
      fimTurno: configuracoesHorario.fimTurnoManhaCalculado,
      aulas: configuracoesHorario.aulasTurnoManha || [],
    },
    tarde: {
      titulo: "Tarde",
      inicioTurno: configuracoesHorario.inicioTurnoTarde,
      fimTurno: configuracoesHorario.fimTurnoTardeCalculado,
      aulas: configuracoesHorario.aulasTurnoTarde || [],
    },
    noite: {
      titulo: "Noite",
      inicioTurno: configuracoesHorario.inicioTurnoNoite,
      fimTurno: configuracoesHorario.fimTurnoNoiteCalculado,
      aulas: configuracoesHorario.aulasTurnoNoite || [],
    },
  }

  // Informações específicas para o turno selecionado
  const dadosTurno = turnoInfo[turno]

  return (
    <Card className="border-muted-foreground/20 bg-card border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="text-primary h-5 w-5" />
            <CardTitle className="text-base font-bold tracking-tight lg:text-lg">
              Horários do Turno da {dadosTurno.titulo}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Horários de início e fim do turno */}
        <div className="flex flex-col space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <span className="font-medium">Início do Turno:</span>
            </div>
            <span className="text-lg font-bold tabular-nums">
              {dadosTurno.inicioTurno || "Não definido"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TimerIcon className="text-primary h-5 w-5" />
              <span className="font-medium">Fim do Turno:</span>
            </div>
            <span className="text-lg font-bold tabular-nums">
              {dadosTurno.fimTurno || "Não calculado"}
            </span>
          </div>
        </div>

        {/* Seção de aulas */}
        {dadosTurno.aulas && dadosTurno.aulas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Detalhamento das Aulas</h3>
              <span className="text-muted-foreground text-sm">
                {dadosTurno.aulas.length} aulas
              </span>
            </div>
            <Separator />

            <div className="grid gap-2">
              {dadosTurno.aulas.map((aula, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between rounded-md px-4 py-3 transition-colors",
                    index % 2 === 0 ? "bg-muted/50" : "",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 grid place-content-center rounded-full p-1.5">
                      <Clock className="text-primary size-4" />
                    </div>
                    <span className="font-medium">Aula {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm md:text-base">
                    <span className="font-bold tabular-nums">
                      {aula.inicio} - {aula.fim}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há aulas configuradas */}
        {(!dadosTurno.aulas || dadosTurno.aulas.length === 0) && (
          <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center">
            Não há aulas configuradas para este turno.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
