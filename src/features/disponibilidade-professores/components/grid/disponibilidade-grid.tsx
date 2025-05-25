import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Loader2 } from "lucide-react"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import { GridTurno } from "./grid-turno"
import {
  useConfiguracaoHorario,
  getTurnoData,
} from "../../hooks/use-configuracoes-horario"

// Tipos
interface DisponibilidadeGridProps {
  professorId: string
  periodoId: string
  disponibilidades?: DisponibilidadeResponseDto[]
  isLoading?: boolean
  readonly?: boolean
}

// Componente principal refatorado
export const DisponibilidadeGrid: React.FC<DisponibilidadeGridProps> = ({
  professorId,
  periodoId,
  disponibilidades = [],
  isLoading = false,
  readonly = false,
}) => {
  // Buscar configurações de horário
  const { data: configuracaoHorario, isLoading: isLoadingConfig } =
    useConfiguracaoHorario()

  // Estados de loading combinados
  const isLoadingData = isLoading || isLoadingConfig

  // Extrair dados dos turnos
  const turnoManha = getTurnoData(configuracaoHorario ?? undefined, "manha")
  const turnoTarde = getTurnoData(configuracaoHorario ?? undefined, "tarde")
  const turnoNoite = getTurnoData(configuracaoHorario ?? undefined, "noite")

  if (isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grid de Disponibilidades por Turnos
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
            Grid de Disponibilidades por Turnos
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
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
            Grid de Disponibilidades por Turnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clock className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Nenhum turno configurado</h3>
            <p className="text-muted-foreground">
              Os horários dos turnos ainda não foram configurados pelo diretor.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grid de Disponibilidades por Turnos
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Configure sua disponibilidade para cada turno de acordo com os
            horários estabelecidos pelo diretor.
          </p>
        </CardHeader>
      </Card>

      {/* Grids por turno */}
      {turnoManha && turnoManha.aulas.length > 0 && (
        <GridTurno
          turno="manha"
          turnoData={turnoManha}
          professorId={professorId}
          periodoId={periodoId}
          disponibilidades={disponibilidades}
          isLoading={isLoading}
          readonly={readonly}
        />
      )}

      {turnoTarde && turnoTarde.aulas.length > 0 && (
        <GridTurno
          turno="tarde"
          turnoData={turnoTarde}
          professorId={professorId}
          periodoId={periodoId}
          disponibilidades={disponibilidades}
          isLoading={isLoading}
          readonly={readonly}
        />
      )}

      {turnoNoite && turnoNoite.aulas.length > 0 && (
        <GridTurno
          turno="noite"
          turnoData={turnoNoite}
          professorId={professorId}
          periodoId={periodoId}
          disponibilidades={disponibilidades}
          isLoading={isLoading}
          readonly={readonly}
        />
      )}
    </div>
  )
}
