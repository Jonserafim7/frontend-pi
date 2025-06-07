import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Grid, List, RefreshCw, Plus } from "lucide-react"
import { PropostaCard } from "./proposta-card"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"

export interface PropostasListProps {
  /** Lista de propostas para exibir */
  propostas: PropostaHorarioResponseDto[]
  /** Se está carregando dados */
  isLoading?: boolean
  /** Se houve erro ao carregar */
  isError?: boolean
  /** Callback para recarregar dados */
  onRefresh?: () => void
  /** Se deve exibir ações de coordenador */
  showCoordenadorActions?: boolean
  /** Se deve exibir ações de diretor */
  showDiretorActions?: boolean
  /** Callback para criar nova proposta */
  onCreate?: () => void
  /** Callback para visualizar proposta */
  onView?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para editar proposta */
  onEdit?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para enviar proposta */
  onEnviar?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para aprovar proposta */
  onAprovar?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para rejeitar proposta */
  onRejeitar?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para excluir proposta */
  onDelete?: (proposta: PropostaHorarioResponseDto) => void
  /** Layout inicial (grid ou list) */
  initialLayout?: "grid" | "list"
  /** Se deve exibir abas por status */
  showStatusTabs?: boolean
  /** Título da lista */
  title?: string
  /** Descrição da lista */
  description?: string
}

type SortOption =
  | "created_desc"
  | "created_asc"
  | "updated_desc"
  | "updated_asc"
  | "name_asc"
  | "name_desc"

/**
 * Componente para exibir e gerenciar listas de propostas de horário.
 *
 * Características:
 * - Filtros por status, busca textual e ordenação
 * - Layouts em grid ou lista
 * - Abas por status (opcional)
 * - Estatísticas resumidas
 * - Ações contextuais por papel de usuário
 * - Estados de loading e error
 * - Responsivo
 */
export function PropostasList({
  propostas,
  isLoading = false,
  isError = false,
  onRefresh,
  showCoordenadorActions = false,
  showDiretorActions = false,
  onCreate,
  onView,
  onEdit,
  onEnviar,
  onAprovar,
  onRejeitar,
  onDelete,
  initialLayout = "grid",
  showStatusTabs = true,
  title = "Propostas de Horário",
  description,
}: PropostasListProps) {
  // Estados locais
  const [layout, setLayout] = useState<"grid" | "list">(initialLayout)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("created_desc")

  /**
   * Configuração dos status para filtros e estatísticas
   */
  const statusConfig = {
    [PropostaHorarioResponseDtoStatus.DRAFT]: {
      label: "Rascunhos",
      color: "text-yellow-700 bg-yellow-50",
      count: 0,
    },
    [PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO]: {
      label: "Pendentes",
      color: "text-blue-700 bg-blue-50",
      count: 0,
    },
    [PropostaHorarioResponseDtoStatus.APROVADA]: {
      label: "Aprovadas",
      color: "text-green-700 bg-green-50",
      count: 0,
    },
    [PropostaHorarioResponseDtoStatus.REJEITADA]: {
      label: "Rejeitadas",
      color: "text-red-700 bg-red-50",
      count: 0,
    },
  }

  /**
   * Calcula estatísticas das propostas
   */
  const stats = useMemo(() => {
    const statsObj = { ...statusConfig }

    propostas.forEach((proposta) => {
      if (statsObj[proposta.status]) {
        statsObj[proposta.status].count++
      }
    })

    return statsObj
  }, [propostas])

  /**
   * Filtra e ordena propostas
   */
  const filteredAndSortedPropostas = useMemo(() => {
    let filtered = propostas

    // Filtro por busca textual
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (proposta) =>
          proposta.curso.nome.toLowerCase().includes(searchLower) ||
          String(proposta.curso.codigo).toLowerCase().includes(searchLower) ||
          proposta.coordenadorQueSubmeteu.nome
            .toLowerCase()
            .includes(searchLower) ||
          `${proposta.periodoLetivo.ano}/${proposta.periodoLetivo.semestre}`.includes(
            searchLower,
          ),
      )
    }

    // Filtro por status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((proposta) => proposta.status === selectedStatus)
    }

    // Ordenação
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "created_desc":
          return (
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
          )
        case "created_asc":
          return (
            new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime()
          )
        case "updated_desc":
          return (
            new Date(b.dataAtualizacao).getTime() -
            new Date(a.dataAtualizacao).getTime()
          )
        case "updated_asc":
          return (
            new Date(a.dataAtualizacao).getTime() -
            new Date(b.dataAtualizacao).getTime()
          )
        case "name_asc":
          return a.curso.nome.localeCompare(b.curso.nome)
        case "name_desc":
          return b.curso.nome.localeCompare(a.curso.nome)
        default:
          return 0
      }
    })

    return sorted
  }, [propostas, searchTerm, selectedStatus, sortBy])

  /**
   * Propostas agrupadas por status para as abas
   */
  const propostasByStatus = useMemo(() => {
    return {
      all: filteredAndSortedPropostas,
      [PropostaHorarioResponseDtoStatus.DRAFT]: filteredAndSortedPropostas.filter(
        (p) => p.status === PropostaHorarioResponseDtoStatus.DRAFT,
      ),
      [PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO]:
        filteredAndSortedPropostas.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO,
        ),
      [PropostaHorarioResponseDtoStatus.APROVADA]:
        filteredAndSortedPropostas.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.APROVADA,
        ),
      [PropostaHorarioResponseDtoStatus.REJEITADA]:
        filteredAndSortedPropostas.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.REJEITADA,
        ),
    }
  }, [filteredAndSortedPropostas])

  /**
   * Renderiza uma lista de propostas
   */
  const renderPropostas = (
    propostas: PropostaHorarioResponseDto[],
    compact = false,
  ) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted h-48 animate-pulse rounded-lg"
            />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="py-12 text-center">
          <div className="text-muted-foreground mb-4">
            Erro ao carregar propostas
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </div>
      )
    }

    if (propostas.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="text-muted-foreground mb-4">
            {searchTerm || selectedStatus !== "all" ?
              "Nenhuma proposta encontrada com os filtros aplicados"
            : "Nenhuma proposta encontrada"}
          </div>
          {onCreate && !searchTerm && selectedStatus === "all" && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira proposta
            </Button>
          )}
        </div>
      )
    }

    const gridClass =
      layout === "grid" ?
        "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "space-y-4"

    return (
      <div className={gridClass}>
        {propostas.map((proposta) => (
          <PropostaCard
            key={proposta.id}
            proposta={proposta}
            compact={compact || layout === "list"}
            showCoordenadorActions={showCoordenadorActions}
            showDiretorActions={showDiretorActions}
            onView={onView}
            onEdit={onEdit}
            onEnviar={onEnviar}
            onAprovar={onAprovar}
            onRejeitar={onRejeitar}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{propostas.length}</div>
          <div className="text-muted-foreground text-sm">Total</div>
        </div>

        {Object.entries(stats).map(([status, config]) => (
          <div
            key={status}
            className="rounded-lg border p-4"
          >
            <div className="text-2xl font-bold">{config.count}</div>
            <div className="text-muted-foreground text-sm">{config.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros e controles */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          {/* Busca */}
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar propostas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por status (se não usar abas) */}
          {!showStatusTabs && (
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem
                    key={status}
                    value={status}
                  >
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Ordenação */}
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Mais recentes</SelectItem>
              <SelectItem value="created_asc">Mais antigas</SelectItem>
              <SelectItem value="updated_desc">
                Atualizadas recentemente
              </SelectItem>
              <SelectItem value="updated_asc">
                Atualizadas há mais tempo
              </SelectItem>
              <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Controles de layout */}
        <div className="flex items-center gap-2">
          <Button
            variant={layout === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setLayout("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setLayout("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      {showStatusTabs ?
        <Tabs
          defaultValue="all"
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">
              Todas ({propostasByStatus.all.length})
            </TabsTrigger>
            {Object.entries(statusConfig).map(([status]) => (
              <TabsTrigger
                key={status}
                value={status}
              >
                {statusConfig[status as keyof typeof statusConfig].label} (
                {stats[status as keyof typeof stats].count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            {renderPropostas(propostasByStatus.all)}
          </TabsContent>

          {Object.entries(statusConfig).map(([status]) => (
            <TabsContent
              key={status}
              value={status}
            >
              {renderPropostas(
                propostasByStatus[status as keyof typeof propostasByStatus],
              )}
            </TabsContent>
          ))}
        </Tabs>
      : renderPropostas(filteredAndSortedPropostas)}
    </div>
  )
}
