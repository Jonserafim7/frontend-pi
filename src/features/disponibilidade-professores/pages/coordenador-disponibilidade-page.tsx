import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  Filter,
  Users,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { DisponibilidadesDataTable } from "../components/data-table/disponibilidades-data-table"
import { SkeletonTable } from "@/components/skeleton-table"
import { disponibilidadeColumns } from "../components/data-table/disponibilidade-columns"
import { useDisponibilidades } from "../hooks/use-disponibilidades"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"

/**
 * Interface para dados do professor (mock)
 */
interface Professor {
  id: string
  nome: string
  email: string
  departamento?: string
}

/**
 * Interface para dados do período letivo (mock)
 */
interface PeriodoLetivo {
  id: string
  nome: string
  ativo: boolean
}

/**
 * Página de visualização de disponibilidades para coordenadores
 */
export function CoordenadorDisponibilidadePage() {
  // Estado dos filtros
  const [selectedProfessor, setSelectedProfessor] = useState<string>("all")
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("current")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - substituir por dados reais do contexto/API
  const professores: Professor[] = [
    {
      id: "19eab2e6-4f8c-482e-aadf-c81a2f6e09d8", // Pedro Professor
      nome: "Pedro Professor",
      email: "professor1@escola.edu",
      departamento: "Computação",
    },
    {
      id: "31cb9124-3610-4267-951b-eba64e4981b6", // Maria Professora
      nome: "Maria Professora",
      email: "professor2@escola.edu",
      departamento: "Matemática",
    },
  ]

  const periodos: PeriodoLetivo[] = [
    { id: "06a6d41c-40d5-42b6-a7f1-5137a4533ea6", nome: "2025.1", ativo: true },
    { id: "periodo-2024-2", nome: "2024.2", ativo: false },
  ]

  const currentPeriodo = periodos.find((p) => p.ativo) || periodos[0]

  // Query com filtros
  const queryParams = {
    professorId: selectedProfessor !== "all" ? selectedProfessor : undefined,
    periodoLetivoId:
      selectedPeriodo !== "current" ? selectedPeriodo : currentPeriodo.id,
  }

  const { data: allDisponibilidades, isLoading } =
    useDisponibilidades(queryParams)

  // Usar dados diretamente da API
  const disponibilidades = (allDisponibilidades as any)?.data || []

  // Filtro adicional por termo de busca
  const filteredDisponibilidades =
    searchTerm ?
      disponibilidades.filter((d: DisponibilidadeResponseDto) =>
        d.usuarioProfessor.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : disponibilidades

  // Handlers
  const handleClearFilters = () => {
    setSelectedProfessor("all")
    setSelectedPeriodo("current")
    setSearchTerm("")
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  // Calcular estatísticas
  const stats = {
    total: filteredDisponibilidades.length,
    disponivel: filteredDisponibilidades.filter(
      (d: DisponibilidadeResponseDto) => d.status === "DISPONIVEL",
    ).length,
    indisponivel: filteredDisponibilidades.filter(
      (d: DisponibilidadeResponseDto) => d.status === "INDISPONIVEL",
    ).length,
    professores: new Set(
      filteredDisponibilidades.map(
        (d: DisponibilidadeResponseDto) => d.usuarioProfessor.id,
      ),
    ).size,
  }

  const selectedProfessorName =
    selectedProfessor !== "all" ?
      professores.find((p) => p.id === selectedProfessor)?.nome
    : null

  const selectedPeriodoName =
    selectedPeriodo !== "current" ?
      periodos.find((p) => p.id === selectedPeriodo)?.nome
    : null

  return (
    <div className="container mx-auto space-y-8 p-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={Eye} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              Disponibilidades dos Professores
            </h1>
            <p className="text-muted-foreground">
              Visualize e monitore as disponibilidades de todos os professores
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
        >
          <RefreshCw />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar disponibilidades específicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Busca por texto */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search"
                  placeholder="Nome do professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filtro por professor */}
            <div className="space-y-2">
              <Label>Professor</Label>
              <Select
                value={selectedProfessor}
                onValueChange={setSelectedProfessor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os professores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os professores</SelectItem>
                  {professores.map((professor) => (
                    <SelectItem
                      key={professor.id}
                      value={professor.id}
                    >
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por período */}
            <div className="space-y-2">
              <Label>Período Letivo</Label>
              <Select
                value={selectedPeriodo}
                onValueChange={setSelectedPeriodo}
              >
                <SelectTrigger>
                  <SelectValue placeholder={currentPeriodo.nome} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Período Atual ({currentPeriodo.nome})
                  </SelectItem>
                  {periodos.map((periodo) => (
                    <SelectItem
                      key={periodo.id}
                      value={periodo.id}
                    >
                      {periodo.nome} {periodo.ativo && "(Ativo)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão limpar filtros */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Filtros ativos */}
          {(selectedProfessor !== "all" ||
            selectedPeriodo !== "current" ||
            searchTerm) && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-muted-foreground text-sm">
                Filtros ativos:
              </span>
              {selectedProfessor !== "all" && selectedProfessorName && (
                <Badge variant="secondary">
                  Professor: {selectedProfessorName}
                </Badge>
              )}
              {selectedPeriodo !== "current" && selectedPeriodoName && (
                <Badge variant="secondary">Período: {selectedPeriodoName}</Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary">Busca: "{searchTerm}"</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.professores}
            </div>
            <p className="text-muted-foreground text-xs">
              Professores com disponibilidade cadastrada
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">Disponível</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.disponivel}
            </div>
            <p className="text-muted-foreground text-xs">
              Horários disponíveis para agendamento
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-red-500/10 to-transparent py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-2">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">
                  Indisponível
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.indisponivel}
            </div>
            <p className="text-muted-foreground text-xs">
              Horários bloqueados ou indisponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.total}
            </div>
            <p className="text-muted-foreground text-xs">
              Total de registros no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Data Table */}
      {isLoading ?
        <SkeletonTable
          columns={disponibilidadeColumns.length}
          rows={5}
        />
      : <DisponibilidadesDataTable
          data={filteredDisponibilidades}
          onEdit={undefined} // Coordenadores não editam
          onDelete={undefined} // Coordenadores não deletam
          isLoading={isLoading}
        />
      }
    </div>
  )
}
