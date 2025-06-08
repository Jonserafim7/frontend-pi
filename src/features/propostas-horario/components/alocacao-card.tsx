import { Calendar, Clock, BookOpen, User, GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

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
 * Cores para diferentes dias da semana
 */
const coresDias = {
  SEGUNDA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  TERCA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  QUARTA: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  QUINTA: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  SEXTA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  SABADO: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  DOMINGO:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
} as const

interface AlocacaoCardProps {
  alocacao: AlocacaoHorarioResponseDto
}

/**
 * Componente para exibir uma alocação de horário em formato de card
 */
export function AlocacaoCard({ alocacao }: AlocacaoCardProps) {
  const { turma, diaDaSemana, horaInicio, horaFim } = alocacao
  const { disciplinaOfertada, codigoDaTurma, professorAlocado } = turma
  const { disciplina } = disciplinaOfertada

  // Calcular duração da aula
  const inicio = new Date(`1970-01-01T${horaInicio}:00`)
  const fim = new Date(`1970-01-01T${horaFim}:00`)
  const duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60)
  const duracaoHoras = Math.floor(duracaoMinutos / 60)
  const duracaoMinutosRestantes = duracaoMinutos % 60

  const duracaoTexto =
    duracaoHoras > 0 ?
      `${duracaoHoras}h${duracaoMinutosRestantes > 0 ? ` ${duracaoMinutosRestantes}min` : ""}`
    : `${duracaoMinutosRestantes}min`

  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-lg font-semibold">
            {disciplina.nome}
          </CardTitle>
          <Badge
            variant="secondary"
            className={coresDias[diaDaSemana]}
          >
            {diasSemanaMap[diaDaSemana]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações da turma */}
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4" />
          <span className="font-medium">Turma:</span>
          <span>{codigoDaTurma}</span>
        </div>

        {/* Horário */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-foreground font-medium">
            {horaInicio} às {horaFim}
          </span>
          <span className="text-muted-foreground">({duracaoTexto})</span>
        </div>

        {/* Professor */}
        {professorAlocado && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="font-medium">Professor:</span>
            <span>{professorAlocado.nome}</span>
          </div>
        )}

        {/* Código da disciplina */}
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">Código:</span>
          <span>{disciplina.codigo || "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
