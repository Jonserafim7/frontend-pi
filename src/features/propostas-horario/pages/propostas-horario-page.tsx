import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, RefreshCw, Save, Users, CheckCircle } from "lucide-react"
import { ScheduleGrid } from "../components/ScheduleGrid"
import { TurmasListComponent } from "../components/TurmasListComponent"
import { useTurmasParaAlocacao } from "../hooks"
import { TurmaSelectionProvider, useTurmaSelection } from "../contexts"
import type { ConfiguracaoHorarioDto } from "@/api-generated/model"
import { cn } from "@/lib/utils"

// Mock data para demonstração - será substituído por dados reais da API
const mockConfiguracaoHorario: ConfiguracaoHorarioDto = {
  id: "1",
  duracaoAulaMinutos: 50,
  numeroAulasPorTurno: 5,
  inicioTurnoManha: "07:00",
  fimTurnoManhaCalculado: "11:30",
  inicioTurnoTarde: "13:00",
  fimTurnoTardeCalculado: "17:30",
  inicioTurnoNoite: "19:00",
  fimTurnoNoiteCalculado: "22:30",
  aulasTurnoManha: [
    { inicio: "07:00", fim: "07:50" },
    { inicio: "07:50", fim: "08:40" },
    { inicio: "08:40", fim: "09:30" },
    { inicio: "09:50", fim: "10:40" },
    { inicio: "10:40", fim: "11:30" },
  ],
  aulasTurnoTarde: [
    { inicio: "13:00", fim: "13:50" },
    { inicio: "13:50", fim: "14:40" },
    { inicio: "14:40", fim: "15:30" },
    { inicio: "15:50", fim: "16:40" },
    { inicio: "16:40", fim: "17:30" },
  ],
  aulasTurnoNoite: [
    { inicio: "19:00", fim: "19:50" },
    { inicio: "19:50", fim: "20:40" },
    { inicio: "20:40", fim: "21:30" },
    { inicio: "21:30", fim: "22:20" },
  ],
  dataCriacao: "2024-01-01T00:00:00Z",
  dataAtualizacao: "2024-01-01T00:00:00Z",
}

const mockPeriodos = [
  { id: 1, nome: "2024.1", status: "ATIVO" },
  { id: 2, nome: "2024.2", status: "PLANEJAMENTO" },
  { id: 3, nome: "2025.1", status: "PLANEJAMENTO" },
]

const mockCursos = [
  { id: 1, nome: "Análise e Desenvolvimento de Sistemas" },
  { id: 2, nome: "Gestão da Tecnologia da Informação" },
  { id: 3, nome: "Redes de Computadores" },
]

// Componente interno que usa o contexto
function PropostasHorarioContent() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("1")
  const { turmaSelecionada, selecionarTurma, limparSelecao, isSelecionada } =
    useTurmaSelection()

  // Usar o hook para buscar turmas para alocação
  const { turmas, total, estatisticas, isLoading, error } = useTurmasParaAlocacao(
    {
      filtros: {
        periodoLetivoId: periodoSelecionado,
        somenteComProfessor: true,
      },
      enabled: !!periodoSelecionado,
    },
  )

  const handleSlotClick = (slotInfo: any) => {
    if (turmaSelecionada) {
      console.log(
        "Alocando turma:",
        turmaSelecionada.turma.codigoDaTurma,
        "no slot:",
        slotInfo,
      )
      // TODO: Implementar lógica de alocação
    } else {
      console.log("Nenhuma turma selecionada para alocar no slot:", slotInfo)
    }
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <CalendarIcon className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Propostas de Horário</h1>
            <p className="text-muted-foreground">
              Gerencie a alocação de turmas nos horários
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4" />
            Salvar Proposta
          </Button>
        </div>
      </div>

      {/* Turma Selecionada */}
      {turmaSelecionada && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-primary h-5 w-5" />
                <div>
                  <div className="font-medium">
                    Turma Selecionada: {turmaSelecionada.turma.codigoDaTurma}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {turmaSelecionada.turma.disciplinaOfertada?.disciplina
                      ?.nome || "Disciplina"}{" "}
                    -
                    {turmaSelecionada.turma.professorAlocado?.nome ||
                      "Sem professor"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={limparSelecao}
              >
                Limpar Seleção
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Configure os filtros para visualizar as turmas e horários
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Período Letivo</label>
            <Select
              value={periodoSelecionado}
              onValueChange={setPeriodoSelecionado}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">2024.1</SelectItem>
                <SelectItem value="2">2024.2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas das Turmas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Total de Turmas</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{total}</span>
              {isLoading && (
                <span className="text-muted-foreground ml-2 text-sm">
                  Carregando...
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400" />
              <span className="text-sm font-medium">Não Alocadas</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {estatisticas.totalNaoAlocadas}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="text-sm font-medium">Parcialmente Alocadas</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {estatisticas.totalParcialmenteAlocadas}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="text-sm font-medium">Totalmente Alocadas</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {estatisticas.totalTotalmenteAlocadas}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Lista de Turmas - Usando o novo componente */}
        <div className="lg:col-span-1">
          <TurmasListComponent
            turmas={turmas}
            isLoading={isLoading}
            error={error}
            onTurmaSelect={selecionarTurma}
            onTurmaDeselect={() => limparSelecao()}
            isSelecionada={isSelecionada}
          />
        </div>

        {/* Grid de Horários */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Grade de Horários</CardTitle>
            <CardDescription>
              {turmaSelecionada ?
                `Clique em um slot para alocar a turma ${turmaSelecionada.turma.codigoDaTurma}`
              : "Selecione uma turma para começar a alocação"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleGrid
              configuracaoHorario={mockConfiguracaoHorario}
              onSlotClick={handleSlotClick}
              className="min-h-[600px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente principal com provider
export function PropostasHorarioPage() {
  return (
    <TurmaSelectionProvider>
      <PropostasHorarioContent />
    </TurmaSelectionProvider>
  )
}
