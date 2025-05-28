import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { DroppableSlot } from "./droppable-slot"
import { DIAS_SEMANA } from "@/lib/constants/dias-da-semana.constant"
import {
  getTurnoIcon,
  getTurnoColor,
  getTurnoBadgeColor,
} from "../utils/turno-styles"
import type { TurnoType, TurnoData } from "../hooks/use-configuracoes-horario"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const TurnoIcon = getTurnoIcon(turno)
  const turnoColorClass = getTurnoColor(turno)
  const turnoBadgeColorClass = getTurnoBadgeColor(turno)

  // Função para agrupar alocações por slot para múltiplas turmas
  const getAlocacoesPorSlot = (dia: string, hora: string) => {
    return alocacoes.filter(
      (a) => a.diaDaSemana === dia && a.horaInicio === hora && a.turno === turno,
    )
  }

  return (
    <Card className="bg-card horarios-grid border shadow-lg">
      <Collapsible
        open={!isCollapsed}
        onOpenChange={setIsCollapsed}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <TurnoIcon className={`h-5 w-5 ${turnoColorClass}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-foreground">
                  Período {turnoData.titulo}
                </span>
                <p className="text-muted-foreground text-sm font-normal">
                  {turnoData.inicioTurno} às {turnoData.fimTurno}
                </p>
              </div>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={turnoBadgeColorClass}
              >
                <span className="hidden sm:inline">
                  {getAlocacoesPorTurno(turno)} aulas alocadas
                </span>
                <span className="sm:hidden">{getAlocacoesPorTurno(turno)}</span>
              </Badge>

              {/* Botão de colapsar para mobile */}
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 md:hidden"
                >
                  {isCollapsed ?
                    <ChevronDown className="h-4 w-4" />
                  : <ChevronUp className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            {/* Desktop: Grid tradicional */}
            <div className="dnd-scroll-container hidden lg:block">
              <div className="grid grid-cols-7 gap-3">
                {/* Header */}
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Calendar className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
                  <span className="text-foreground text-xs font-medium">
                    Horário
                  </span>
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
                      <div className="text-muted-foreground text-xs">
                        {horario.fim}
                      </div>
                    </div>
                    {DIAS_SEMANA.map((dia) => {
                      const slotId = `${dia.key}-${horario.inicio}-${turno}`
                      const alocacoesPorSlot = getAlocacoesPorSlot(
                        dia.key,
                        horario.inicio,
                      )

                      return (
                        <DroppableSlot
                          key={slotId}
                          slotId={slotId}
                          alocacoes={alocacoesPorSlot}
                          maxCapacity={3}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet: Grid compacto */}
            <div className="hidden md:block lg:hidden">
              <div className="dnd-scroll-container space-y-2">
                {/* Header compacto */}
                <div className="grid grid-cols-6 gap-2 text-xs">
                  {DIAS_SEMANA.slice(0, 5).map((dia) => (
                    <div
                      key={dia.key}
                      className="text-center font-medium"
                    >
                      {dia.short}
                    </div>
                  ))}
                  <div className="text-center font-medium">Sáb</div>
                </div>

                {/* Slots por horário */}
                {turnoData.aulas.map((horario) => (
                  <div
                    key={horario.inicio}
                    className="space-y-2"
                  >
                    <div className="bg-muted/50 rounded py-1 text-center text-sm font-medium">
                      {horario.inicio} - {horario.fim}
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {DIAS_SEMANA.map((dia) => {
                        const slotId = `${dia.key}-${horario.inicio}-${turno}`
                        const alocacoesPorSlot = getAlocacoesPorSlot(
                          dia.key,
                          horario.inicio,
                        )

                        return (
                          <DroppableSlot
                            key={slotId}
                            slotId={slotId}
                            alocacoes={alocacoesPorSlot}
                            maxCapacity={2} // Reduzido para tablet
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Lista vertical */}
            <div className="block md:hidden">
              <div className="dnd-scroll-container space-y-3">
                {turnoData.aulas.map((horario) => (
                  <div
                    key={horario.inicio}
                    className="space-y-2"
                  >
                    <div className="bg-card/95 sticky top-0 rounded-lg border p-2 shadow-sm backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-sm font-semibold">
                          {horario.inicio} - {horario.fim}
                        </div>
                      </div>
                    </div>

                    {/* Grid de dias para mobile (2 colunas) */}
                    <div className="grid grid-cols-2 gap-2">
                      {DIAS_SEMANA.map((dia) => {
                        const slotId = `${dia.key}-${horario.inicio}-${turno}`
                        const alocacoesPorSlot = getAlocacoesPorSlot(
                          dia.key,
                          horario.inicio,
                        )

                        return (
                          <div
                            key={slotId}
                            className="space-y-1"
                          >
                            <div className="text-muted-foreground text-center text-xs font-medium">
                              {dia.short}
                            </div>
                            <DroppableSlot
                              slotId={slotId}
                              alocacoes={alocacoesPorSlot}
                              maxCapacity={1} // Apenas 1 turma por slot no mobile
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
