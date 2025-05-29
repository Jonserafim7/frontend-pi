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
import { CalendarIcon, RefreshCw, Save } from "lucide-react"
import { ScheduleGrid } from "../components/ScheduleGrid"
import type { ConfiguracaoHorarioDto } from "@/api-generated/model"

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
    { inicio: "21:40", fim: "22:30" },
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

export function PropostasHorarioPage() {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("1")
  const [selectedCurso, setSelectedCurso] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  const handleSlotClick = (slotInfo: {
    day: string
    startTime: string
    endTime: string
    turno: string
  }) => {
    console.log("Slot clicado:", slotInfo)
    // Aqui será implementada a lógica de seleção de slot
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simular carregamento
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleSave = () => {
    console.log("Salvando propostas de horário...")
    // Aqui será implementada a lógica de salvamento
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Propostas de Horário
          </h1>
          <p className="text-muted-foreground">
            Gerencie e visualize as propostas de horário para os cursos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Selecione o período letivo e curso para visualizar as propostas de
            horário
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">
              Período Letivo
            </label>
            <Select
              value={selectedPeriodo}
              onValueChange={setSelectedPeriodo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {mockPeriodos.map((periodo) => (
                  <SelectItem
                    key={periodo.id}
                    value={periodo.id.toString()}
                  >
                    <div className="flex items-center gap-2">
                      {periodo.nome}
                      <Badge
                        variant={
                          periodo.status === "ATIVO" ? "default" : "secondary"
                        }
                      >
                        {periodo.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Curso</label>
            <Select
              value={selectedCurso}
              onValueChange={setSelectedCurso}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                {mockCursos.map((curso) => (
                  <SelectItem
                    key={curso.id}
                    value={curso.id.toString()}
                  >
                    {curso.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Horários */}
      <Card>
        <CardHeader>
          <CardTitle>Grade de Horários</CardTitle>
          <CardDescription>
            Clique nos slots para alocar turmas. Use as cores para identificar
            diferentes tipos de alocação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleGrid
            configuracaoHorario={mockConfiguracaoHorario}
            onSlotClick={handleSlotClick}
          />
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-green-300 bg-green-100"></div>
              <span className="text-sm">Slot disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-blue-300 bg-blue-100"></div>
              <span className="text-sm">Turma alocada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-red-300 bg-red-100"></div>
              <span className="text-sm">Conflito detectado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100"></div>
              <span className="text-sm">Slot indisponível</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
