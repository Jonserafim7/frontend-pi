import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Filter, Users, Search, RefreshCw } from "lucide-react"
import { DisponibilidadeList, DisponibilidadesDataTable } from "../components"
import type { DisponibilidadeTableData } from "../components"
import { useDisponibilidades } from "../hooks/use-disponibilidades"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import type {
  DiaSemana,
  StatusDisponibilidade,
} from "../schemas/disponibilidade-schemas"

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
 * Função para converter DisponibilidadeResponseDto para DisponibilidadeTableData
 */
function convertToTableData(
  dto: DisponibilidadeResponseDto,
): DisponibilidadeTableData {
  return {
    id: dto.id,
    diaDaSemana: dto.diaDaSemana as DiaSemana,
    horaInicio: dto.horaInicio,
    horaFim: dto.horaFim,
    status: dto.status as StatusDisponibilidade,
    professor: {
      id: dto.usuarioProfessor.id,
      nome: dto.usuarioProfessor.nome,
    },
    periodoLetivo: {
      id: dto.periodoLetivo.id,
      nome: `${dto.periodoLetivo.ano}.${dto.periodoLetivo.semestre}`,
    },
    dataCriacao: new Date(dto.dataCriacao),
    dataAtualizacao: new Date(dto.dataAtualizacao),
  }
}

/**
 * Página de visualização de disponibilidades para coordenadores
 */
export function CoordenadorDisponibilidadePage() {
  // Estado dos filtros
  const [selectedProfessor, setSelectedProfessor] = useState<string>("all")
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("current")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "table">("table")

  // Mock data - substituir por dados reais
  const professores: Professor[] = [
    {
      id: "prof-123",
      nome: "Dr. João Silva",
      email: "joao.silva@univ.br",
      departamento: "Computação",
    },
    {
      id: "prof-124",
      nome: "Dra. Maria Santos",
      email: "maria.santos@univ.br",
      departamento: "Matemática",
    },
    {
      id: "prof-125",
      nome: "Dr. Pedro Oliveira",
      email: "pedro.oliveira@univ.br",
      departamento: "Computação",
    },
  ]

  const periodos: PeriodoLetivo[] = [
    { id: "periodo-2024-1", nome: "2024.1", ativo: true },
    { id: "periodo-2023-2", nome: "2023.2", ativo: false },
  ]

  const currentPeriodo = periodos.find((p) => p.ativo) || periodos[0]

  // Usar apenas o hook principal com filtros específicos
  const queryParams = {
    professorId: selectedProfessor !== "all" ? selectedProfessor : undefined,
    periodoLetivoId:
      selectedPeriodo !== "current" ? selectedPeriodo : currentPeriodo.id,
  }

  const { data: allDisponibilidades, isLoading } =
    useDisponibilidades(queryParams)

  // Converter dados para o formato da tabela
  const disponibilidades =
    allDisponibilidades?.data ?
      allDisponibilidades.data.map(convertToTableData)
    : []

  // Filtro adicional por termo de busca (se necessário)
  const filteredDisponibilidades =
    searchTerm ?
      disponibilidades.filter((d) =>
        d.professor?.nome?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : disponibilidades

  // Handlers
  const handleClearFilters = () => {
    setSelectedProfessor("all")
    setSelectedPeriodo("current")
    setSearchTerm("")
  }

  const handleRefresh = () => {
    // O React Query automaticamente refaz as queries ao chamar novamente
    window.location.reload()
  }

  // Calcular estatísticas
  const stats = {
    total: filteredDisponibilidades.length,
    disponivel: filteredDisponibilidades.filter((d) => d.status === "DISPONIVEL")
      .length,
    indisponivel: filteredDisponibilidades.filter(
      (d) => d.status === "INDISPONIVEL",
    ).length,
    professores: new Set(filteredDisponibilidades.map((d) => d.professor?.id))
      .size,
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
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Disponibilidades dos Professores
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as disponibilidades de todos os professores
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setViewMode(viewMode === "cards" ? "table" : "cards")
              }
            >
              {viewMode === "cards" ?
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Tabela
                </>
              : <>
                  <Clock className="mr-2 h-4 w-4" />
                  Cards
                </>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
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

      {/* Estatísticas */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm font-medium">
                Professores
              </p>
              <p className="text-2xl font-bold">{stats.professores}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm font-medium">
                Disponível
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.disponivel}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm font-medium">
                Indisponível
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.indisponivel}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Conteúdo Principal */}
      <div className="space-y-6">
        {viewMode === "cards" ?
          <DisponibilidadeList
            disponibilidades={filteredDisponibilidades}
            onEdit={() => {}} // Coordenadores não editam
            onDelete={() => {}} // Coordenadores não deletam
            onCreate={() => {}} // Coordenadores não criam
            isLoading={isLoading}
            loadingStates={{}}
            title="Disponibilidades dos Professores"
            description={`Visualizando ${filteredDisponibilidades.length} disponibilidades`}
            showCreateButton={false}
            showProfessor={true} // Mostrar informações do professor
          />
        : <DisponibilidadesDataTable
            data={filteredDisponibilidades}
            onEdit={() => {}} // Coordenadores não editam
            onDelete={() => {}} // Coordenadores não deletam
            onCreate={() => {}} // Coordenadores não criam
            isLoading={isLoading}
            title="Disponibilidades dos Professores"
            showProfessorColumn={true} // Mostrar coluna do professor
          />
        }
      </div>
    </div>
  )
}
