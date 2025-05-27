import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DroppableSlot } from "./droppable-slot"
import { useDndAlocacao } from "./dnd-provider"
import { Sun, Moon, Calendar } from "lucide-react"

const DIAS_SEMANA = [
  { key: "SEG", label: "Segunda", short: "SEG" },
  { key: "TER", label: "Terça", short: "TER" },
  { key: "QUA", label: "Quarta", short: "QUA" },
  { key: "QUI", label: "Quinta", short: "QUI" },
  { key: "SEX", label: "Sexta", short: "SEX" },
  { key: "SAB", label: "Sábado", short: "SAB" },
]

const HORARIOS_MANHA = [
  { inicio: "07:30", fim: "08:20" },
  { inicio: "08:20", fim: "09:10" },
  { inicio: "09:30", fim: "10:20" },
  { inicio: "10:20", fim: "11:10" },
]

const HORARIOS_TARDE = [
  { inicio: "13:30", fim: "14:20" },
  { inicio: "14:20", fim: "15:10" },
  { inicio: "15:30", fim: "16:20" },
  { inicio: "16:20", fim: "17:10" },
]

export function AlocacaoGrid() {
  const { alocacoes } = useDndAlocacao()

  const getAlocacao = (dia: string, hora: string, turno: string) => {
    return alocacoes.find(
      (a) => a.diaDaSemana === dia && a.horaInicio === hora && a.turno === turno,
    )
  }

  const getAlocacoesPorTurno = (turno: string) => {
    return alocacoes.filter((a) => a.turno === turno).length
  }

  return (
    <div className="h-full space-y-6 overflow-auto">
      {/* Grid Manhã */}
      <Card className="bg-card border shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <Sun className="text-primary h-5 w-5" />
              </div>
              <div>
                <span className="text-foreground">Período Matutino</span>
                <p className="text-muted-foreground text-sm font-normal">
                  07:30 às 11:10
                </p>
              </div>
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {getAlocacoesPorTurno("manha")} aulas alocadas
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
                className="bg-muted rounded-lg border p-3 text-center"
              >
                <span className="text-foreground text-sm font-semibold">
                  {dia.short}
                </span>
                <p className="text-muted-foreground text-xs">{dia.label}</p>
              </div>
            ))}

            {/* Slots */}
            {HORARIOS_MANHA.map((horario) => (
              <div
                key={horario.inicio}
                className="contents"
              >
                <div className="bg-muted rounded-lg border p-3 text-center">
                  <div className="text-foreground text-sm font-medium">
                    {horario.inicio}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {horario.fim}
                  </div>
                </div>
                {DIAS_SEMANA.map((dia) => {
                  const slotId = `${dia.key}-${horario.inicio}-manha`
                  const alocacao = getAlocacao(dia.key, horario.inicio, "manha")

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

      {/* Grid Tarde */}
      <Card className="bg-card border shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <Moon className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <span className="text-foreground">Período Vespertino</span>
                <p className="text-muted-foreground text-sm font-normal">
                  13:30 às 17:10
                </p>
              </div>
            </CardTitle>
            <Badge
              variant="outline"
              className="border-indigo-50/20 bg-indigo-500/10 text-indigo-500"
            >
              {getAlocacoesPorTurno("tarde")} aulas alocadas
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
                className="bg-muted rounded-lg border p-3 text-center"
              >
                <span className="text-foreground text-sm font-semibold">
                  {dia.short}
                </span>
                <p className="text-muted-foreground text-xs">{dia.label}</p>
              </div>
            ))}

            {/* Slots */}
            {HORARIOS_TARDE.map((horario) => (
              <div
                key={horario.inicio}
                className="contents"
              >
                <div className="bg-muted rounded-lg border p-3 text-center">
                  <div className="text-foreground text-sm font-medium">
                    {horario.inicio}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {horario.fim}
                  </div>
                </div>
                {DIAS_SEMANA.map((dia) => {
                  const slotId = `${dia.key}-${horario.inicio}-tarde`
                  const alocacao = getAlocacao(dia.key, horario.inicio, "tarde")

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
    </div>
  )
}
