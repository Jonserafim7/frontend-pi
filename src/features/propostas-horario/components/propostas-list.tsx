import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { PropostaCard } from "./proposta-card"
import { EmptyState } from "./empty-states"
import { usePropostas } from "../hooks/use-propostas"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { useMemo, useState } from "react"

interface PropostasListProps {
  // Configuração da aba
  tabType: "draft" | "pendente" | "aprovada" | "rejeitada"

  // Filtro de curso (opcional)
  courseFilter?: string

  // Ações do diretor (opcional)
  onAprovar?: (proposta: PropostaHorarioResponseDto) => void
  onRejeitar?: (proposta: PropostaHorarioResponseDto) => void

  // Ação para criar nova proposta (apenas para draft)
  onCreateNova?: () => Promise<void>
  isCreatingProposta?: boolean
}

/**
 * Componente independente para exibir lista paginada de propostas
 * Faz suas próprias queries e gerencia paginação internamente
 */
export function PropostasList({
  tabType,
  courseFilter = "",
  onAprovar,
  onRejeitar,
  onCreateNova,
  isCreatingProposta = false,
}: PropostasListProps) {
  const { isCoordenador } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Buscar propostas (React Query faz cache automático)
  const { propostas, isLoading, canViewAll } = usePropostas({
    enabled: true,
  })

  // Filtrar propostas por status e curso
  const filteredPropostas = useMemo(() => {
    let filtered = propostas

    // Filtrar por status baseado na aba ativa
    switch (tabType) {
      case "draft":
        filtered = filtered.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.DRAFT,
        )
        break
      case "pendente":
        filtered = filtered.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO,
        )
        break
      case "aprovada":
        filtered = filtered.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.APROVADA,
        )
        break
      case "rejeitada":
        filtered = filtered.filter(
          (p) => p.status === PropostaHorarioResponseDtoStatus.REJEITADA,
        )
        break
    }

    // Filtrar por curso (apenas para diretores)
    if (canViewAll && courseFilter) {
      filtered = filtered.filter((p) =>
        p.curso.nome.toLowerCase().includes(courseFilter.toLowerCase()),
      )
    }

    return filtered
  }, [propostas, tabType, courseFilter, canViewAll])

  // Paginação
  const totalPages = Math.ceil(filteredPropostas.length / ITEMS_PER_PAGE)
  const paginatedPropostas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredPropostas.slice(startIndex, endIndex)
  }, [filteredPropostas, currentPage])

  // Reset página quando filtros mudarem
  useMemo(() => {
    setCurrentPage(1)
  }, [tabType, courseFilter])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Empty state
  if (paginatedPropostas.length === 0) {
    return (
      <EmptyState
        type={tabType}
        isCoordenador={isCoordenador()}
        onCreateNova={onCreateNova}
        isActionLoading={isCreatingProposta}
      />
    )
  }

  // Lista com propostas
  return (
    <div className="space-y-6">
      {/* Grid de propostas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPropostas.map((proposta) => (
          <PropostaCard
            key={proposta.id}
            proposta={proposta}
            showDiretorActions={canViewAll && tabType === "pendente"}
            onAprovar={onAprovar}
            onRejeitar={onRejeitar}
          />
        ))}
      </div>

      {/* Componente de paginação */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

/**
 * Componente interno para controles de paginação
 */
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <span className="text-muted-foreground text-sm">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

/**
 * Hook customizado para gerenciar paginação (mantido para compatibilidade)
 */
export function usePagination(items: any[], itemsPerPage: number = 10) {
  const totalPages = Math.ceil(items.length / itemsPerPage)

  const getPaginatedItems = (currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }

  return {
    totalPages,
    getPaginatedItems,
  }
}
