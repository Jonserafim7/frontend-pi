import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { useDndAlocacao } from "./dnd-provider"
import { AlocacaoGridTurno } from "./alocacao-grid-turno"
import {
  useConfiguracaoHorario,
  getTurnoData,
} from "../hooks/use-configuracoes-horario"

export function AlocacaoGrid() {
  const { alocacoes } = useDndAlocacao()

  // Buscar configurações de horário
  const { data: configuracaoHorario, isLoading: isLoadingConfig } =
    useConfiguracaoHorario()

  const getAlocacao = (dia: string, hora: string, turno: string) => {
    return alocacoes.find(
      (a) => a.diaDaSemana === dia && a.horaInicio === hora && a.turno === turno,
    )
  }

  const getAlocacoesPorTurno = (turno: string) => {
    return alocacoes.filter((a) => a.turno === turno).length
  }

  // Estados de carregamento e erro
  if (isLoadingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grid de Alocação de Horários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Carregando configurações...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!configuracaoHorario) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grid de Alocação de Horários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clock className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">
              Configurações não encontradas
            </h3>
            <p className="text-muted-foreground">
              As configurações de horário ainda não foram definidas pelo diretor.
              Entre em contato com a direção para configurar os horários.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Extrair dados dos turnos
  const turnoManha = getTurnoData(configuracaoHorario, "manha")
  const turnoTarde = getTurnoData(configuracaoHorario, "tarde")
  const turnoNoite = getTurnoData(configuracaoHorario, "noite")

  // Verificar se pelo menos um turno tem aulas configuradas
  const hasAnyTurnoConfigured =
    (turnoManha?.aulas?.length ?? 0) > 0 ||
    (turnoTarde?.aulas?.length ?? 0) > 0 ||
    (turnoNoite?.aulas?.length ?? 0) > 0

  if (!hasAnyTurnoConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grid de Alocação de Horários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clock className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Nenhum turno configurado</h3>
            <p className="text-muted-foreground">
              Os horários dos turnos ainda não foram configurados pelo diretor.
              Entre em contato com a direção para definir os horários.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full space-y-6 overflow-auto">
      {/* Grids por turno - renderizados dinamicamente */}
      {turnoManha && turnoManha.aulas.length > 0 && (
        <AlocacaoGridTurno
          turno="manha"
          turnoData={turnoManha}
          alocacoes={alocacoes}
          getAlocacao={getAlocacao}
          getAlocacoesPorTurno={getAlocacoesPorTurno}
        />
      )}

      {turnoTarde && turnoTarde.aulas.length > 0 && (
        <AlocacaoGridTurno
          turno="tarde"
          turnoData={turnoTarde}
          alocacoes={alocacoes}
          getAlocacao={getAlocacao}
          getAlocacoesPorTurno={getAlocacoesPorTurno}
        />
      )}

      {turnoNoite && turnoNoite.aulas.length > 0 && (
        <AlocacaoGridTurno
          turno="noite"
          turnoData={turnoNoite}
          alocacoes={alocacoes}
          getAlocacao={getAlocacao}
          getAlocacoesPorTurno={getAlocacoesPorTurno}
        />
      )}
    </div>
  )
}
