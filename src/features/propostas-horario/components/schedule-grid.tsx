import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import type { AulaHorarioDto } from "@/api-generated/model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dias da semana para a grade
const DIAS_SEMANA = [
  { key: "SEGUNDA", label: "Segunda" },
  { key: "TERCA", label: "Terça" },
  { key: "QUARTA", label: "Quarta" },
  { key: "QUINTA", label: "Quinta" },
  { key: "SEXTA", label: "Sexta" },
  { key: "SABADO", label: "Sábado" },
] as const

interface ScheduleGridProps {
  className?: string
}

/**
 * Componente da grade de horários que exibe a estrutura visual
 * baseada na configuração de horários do sistema
 */
export function ScheduleGrid({ className }: ScheduleGridProps) {
  const {
    data: configuracao,
    isLoading,
    error,
  } = useConfiguracoesHorarioControllerGet()

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
                  "Erro ao carregar configuração de horários"
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
          <CardTitle>Grade de Horários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Turno da Manhã */}
          <TurnoSection
            titulo="Manhã"
            aulas={configuracao.aulasTurnoManha}
            inicio={configuracao.inicioTurnoManha}
            fim={configuracao.fimTurnoManhaCalculado}
          />

          {/* Turno da Tarde */}
          <TurnoSection
            titulo="Tarde"
            aulas={configuracao.aulasTurnoTarde}
            inicio={configuracao.inicioTurnoTarde}
            fim={configuracao.fimTurnoTardeCalculado}
          />

          {/* Turno da Noite */}
          <TurnoSection
            titulo="Noite"
            aulas={configuracao.aulasTurnoNoite}
            inicio={configuracao.inicioTurnoNoite}
            fim={configuracao.fimTurnoNoiteCalculado}
          />
        </CardContent>
      </Card>
    </div>
  )
}

interface TurnoSectionProps {
  titulo: string
  aulas: AulaHorarioDto[]
  inicio: string
  fim: string
}

/**
 * Seção da grade para um turno específico (Manhã, Tarde, Noite)
 */
function TurnoSection({ titulo, aulas, inicio, fim }: TurnoSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-sm"
        >
          {titulo}
        </Badge>
        <span className="text-muted-foreground text-sm">
          {inicio} - {fim}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {/* Cabeçalho com dias da semana */}
        <div className="bg-muted/50 grid grid-cols-7 border-b">
          <div className="border-r p-2 text-center text-sm font-medium">
            Horário
          </div>
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia.key}
              className="border-r p-2 text-center text-sm font-medium last:border-r-0"
            >
              {dia.label}
            </div>
          ))}
        </div>

        {/* Linhas de horários */}
        {aulas.map((aula, index) => (
          <div
            key={index}
            className="grid grid-cols-7 border-b last:border-b-0"
          >
            {/* Coluna do horário */}
            <div className="bg-muted/30 border-r p-2 text-center text-sm">
              <div className="font-medium">{aula.inicio}</div>
              <div className="text-muted-foreground text-xs">{aula.fim}</div>
            </div>

            {/* Células para cada dia da semana */}
            {DIAS_SEMANA.map((dia) => (
              <ScheduleCell
                key={`${dia.key}-${aula.inicio}`}
                dia={dia.key}
                horario={aula}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface ScheduleCellProps {
  dia: string
  horario: AulaHorarioDto
}

/**
 * Célula individual da grade de horários
 * Por enquanto só visual, sem funcionalidade de alocação
 */
function ScheduleCell({}: ScheduleCellProps) {
  // Por enquanto, todas as células estão vazias (sem alocações)
  // TODO: Adicionar lógica para exibir alocações existentes

  return (
    <div className="group relative min-h-[60px] border-r p-2 last:border-r-0">
      {/* Célula vazia - botão para adicionar */}
      <Button
        variant="ghost"
        size="sm"
        className="border-muted-foreground/20 hover:border-muted-foreground/40 h-full w-full border-2 border-dashed opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Plus className="text-muted-foreground h-4 w-4" />
      </Button>
    </div>
  )
}
