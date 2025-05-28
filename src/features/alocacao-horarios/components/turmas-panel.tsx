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
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export function TurmasPanel() {
  const { turmas, isLoading } = useDndAlocacao()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

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
    <div className="flex h-full flex-col space-y-4 md:space-y-6">
      {/* Métricas - Desktop */}
      <Card className="border-border bg-card hidden shadow-lg md:block">
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

      {/* Métricas - Mobile (compacto) */}
      <div className="block md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <div className="min-w-[70px] flex-shrink-0 rounded-lg border border-green-500/20 bg-green-500/10 p-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {stats.completas}
              </div>
              <div className="text-xs text-green-600">Completas</div>
            </div>
          </div>
          <div className="min-w-[70px] flex-shrink-0 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2">
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {stats.parciais}
              </div>
              <div className="text-xs text-yellow-600">Parciais</div>
            </div>
          </div>
          <div className="border-primary/20 bg-primary/10 min-w-[70px] flex-shrink-0 rounded-lg border p-2">
            <div className="text-center">
              <div className="text-primary text-lg font-bold">
                {stats.naoAlocadas}
              </div>
              <div className="text-primary text-xs">Pendentes</div>
            </div>
          </div>
          <div className="border-destructive/20 bg-destructive/10 min-w-[70px] flex-shrink-0 rounded-lg border p-2">
            <div className="text-center">
              <div className="text-destructive text-lg font-bold">
                {stats.semProfessor}
              </div>
              <div className="text-destructive text-xs">Sem Prof.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros - Desktop */}
      <Card className="border-border bg-card hidden shadow-lg md:block">
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

      {/* Filtros - Mobile (colapsível) */}
      <Card className="border-border bg-card block shadow-lg md:hidden">
        <Collapsible
          open={isFiltersOpen}
          onOpenChange={setIsFiltersOpen}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="hover:bg-muted/50 cursor-pointer pb-3 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="text-muted-foreground h-4 w-4" />
                  Filtros
                </CardTitle>
                <div className="flex items-center gap-2">
                  {filterStatus !== "all" && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      Filtrado
                    </Badge>
                  )}
                  {isFiltersOpen ?
                    <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-input bg-background pl-10 text-sm"
                />
              </div>

              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="border-input bg-background text-sm">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="completa">✅ Completas</SelectItem>
                  <SelectItem value="parcial">⏳ Parciais</SelectItem>
                  <SelectItem value="nao-alocada">📋 Pendentes</SelectItem>
                  <SelectItem value="sem-professor">⚠️ Sem Prof.</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Lista de Turmas */}
      <Card className="border-border flex-1 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">
              Turmas Disponíveis
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground text-xs"
            >
              {filteredTurmas.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-2 md:p-6">
          <ScrollArea className="h-full">
            <div className="space-y-2 pr-2 md:space-y-3">
              {isLoading ?
                <div className="text-muted-foreground py-8 text-center">
                  <div className="border-border border-t-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 md:h-8 md:w-8" />
                  <p className="text-sm">Carregando turmas...</p>
                </div>
              : <>
                  {filteredTurmas.map((turma) => (
                    <div
                      key={turma.id}
                      className="draggable-turma"
                    >
                      <DraggableTurma turma={turma} />
                    </div>
                  ))}
                  {filteredTurmas.length === 0 && (
                    <div className="text-muted-foreground py-8 text-center">
                      <Search className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
                      <p className="text-sm">Nenhuma turma encontrada</p>
                    </div>
                  )}
                </>
              }
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
