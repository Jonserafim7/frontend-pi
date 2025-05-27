import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { DroppableSlot } from "./droppable-slot"
import { DIAS_SEMANA } from "@/lib/constants/dias-da-semana.constant"
import {
  getTurnoIcon,
  getTurnoColor,
  getTurnoBadgeColor,
} from "../utils/turno-styles"
import type { TurnoType, TurnoData } from "../hooks/use-configuracoes-horario"

interface AlocacaoGridTurnoProps {
  turno: TurnoType
  turnoData: TurnoData
  alocacoes: any[]
  getAlocacao: (dia: string, hora: string, turno: string) => any
  getAlocacoesPorTurno: (turno: string) => number
}

export const AlocacaoGridTurno: React.FC<AlocacaoGridTurnoProps> = ({
  turno,
  turnoData,
  alocacoes,
  getAlocacao,
  getAlocacoesPorTurno,
}) => {
  const TurnoIcon = getTurnoIcon(turno)
  const turnoColorClass = getTurnoColor(turno)
  const turnoBadgeColorClass = getTurnoBadgeColor(turno)

  return (
    <Card className="bg-card border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <TurnoIcon className={`h-5 w-5 ${turnoColorClass}`} />
            </div>
            <div>
              <span className="text-foreground">Período {turnoData.titulo}</span>
              <p className="text-muted-foreground text-sm font-normal">
                {turnoData.inicioTurno} às {turnoData.fimTurno}
              </p>
            </div>
          </CardTitle>
          <Badge
            variant="outline"
            className={turnoBadgeColorClass}
          >
            {getAlocacoesPorTurno(turno)} aulas alocadas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {/* Header */}
          <div className="bg-muted rounded-lg p-3 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
            <span className="text-foreground text-xs font-medium">Horário</span>
          </div>
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia.key}
              className="bg-muted flex flex-col items-center justify-center rounded-lg border p-3 text-center"
            >
              <span className="text-foreground text-sm font-semibold">
                {dia.short}
              </span>
              <p className="text-muted-foreground text-xs">{dia.label}</p>
            </div>
          ))}

          {/* Slots */}
          {turnoData.aulas.map((horario) => (
            <div
              key={horario.inicio}
              className="contents"
            >
              <div className="bg-muted flex flex-col items-center justify-center rounded-lg border p-3 text-center">
                <div className="text-foreground text-sm font-medium">
                  {horario.inicio}
                </div>
                <div className="text-muted-foreground text-xs">{horario.fim}</div>
              </div>
              {DIAS_SEMANA.map((dia) => {
                const slotId = `${dia.key}-${horario.inicio}-${turno}`
                const alocacao = getAlocacao(dia.key, horario.inicio, turno)

                return (
                  <DroppableSlot
                    key={slotId}
                    slotId={slotId}
                    alocacao={alocacao}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
