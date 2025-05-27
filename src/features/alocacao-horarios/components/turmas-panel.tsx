import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DraggableTurma } from "./draggable-turma"
import { useDndAlocacao } from "./dnd-provider"
import { useTurmasStats } from "../hooks/use-turmas-alocacao"
import { useState } from "react"
import {
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

export function TurmasPanel() {
  const { turmas, isLoading } = useDndAlocacao()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredTurmas = turmas.filter((turma) => {
    const matchesSearch =
      turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.professor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || turma.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const stats = useTurmasStats(turmas)

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Métricas */}
      <Card className="border-border bg-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="text-primary h-5 w-5" />
            Status das Turmas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {stats.completas}
                </span>
              </div>
              <p className="mt-1 text-xs text-green-600">Completas</p>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
              <div className="flex items-center justify-between">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">
                  {stats.parciais}
                </span>
              </div>
              <p className="mt-1 text-xs text-yellow-600">Parciais</p>
            </div>

            <div className="border-primary/20 bg-primary/10 rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                  <div className="bg-primary-foreground h-2 w-2 rounded-full"></div>
                </div>
                <span className="text-primary text-2xl font-bold">
                  {stats.naoAlocadas}
                </span>
              </div>
              <p className="text-primary mt-1 text-xs">Pendentes</p>
            </div>

            <div className="border-destructive/20 bg-destructive/10 rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <AlertTriangle className="text-destructive h-5 w-5" />
                <span className="text-destructive text-2xl font-bold">
                  {stats.semProfessor}
                </span>
              </div>
              <p className="text-destructive mt-1 text-xs">Sem Prof.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="border-border bg-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="text-muted-foreground h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Buscar por código, disciplina ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-input bg-background pl-10"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="border-input bg-background">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              <SelectItem value="completa">✅ Completas</SelectItem>
              <SelectItem value="parcial">⏳ Parciais</SelectItem>
              <SelectItem value="nao-alocada">📋 Pendentes</SelectItem>
              <SelectItem value="sem-professor">⚠️ Sem Professor</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Turmas */}
      <Card className="border-border flex-1 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Turmas Disponíveis</CardTitle>
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground"
            >
              {filteredTurmas.length} turmas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {isLoading ?
              <div className="text-muted-foreground py-8 text-center">
                <div className="border-border border-t-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2" />
                <p>Carregando turmas...</p>
              </div>
            : <>
                {filteredTurmas.map((turma) => (
                  <DraggableTurma
                    key={turma.id}
                    turma={turma}
                  />
                ))}
                {filteredTurmas.length === 0 && (
                  <div className="text-muted-foreground py-8 text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Nenhuma turma encontrada</p>
                  </div>
                )}
              </>
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
