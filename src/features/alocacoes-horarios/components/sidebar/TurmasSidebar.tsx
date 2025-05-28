import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, GraduationCap, Users } from "lucide-react"

// Import API hooks using path aliases
import {
  useTurmasControllerFindAll,
  getTurmasControllerFindAllQueryKey,
} from "@/api-generated/client/turmas/turmas"
import type { TurmasControllerFindAllParams } from "@/api-generated/model/turmas-controller-find-all-params"
import type { TurmaResponseDto } from "@/api-generated/model/turma-response-dto"

// Import types from our feature
import type { ComponentWithBaseProps } from "../../types"

// Import the new TurmaCard component
import { TurmaCard } from "./TurmaCard"

interface TurmasSidebarProps extends ComponentWithBaseProps {
  /** ID do período letivo atual para filtrar turmas */
  periodoLetivoId?: string
  /** ID do curso para filtrar turmas (opcional) */
  cursoId?: string
  /** Callback quando uma turma é selecionada para drag */
  onTurmaSelect?: (turma: TurmaResponseDto) => void
  /** Callback quando uma turma é clicada */
  onTurmaClick?: (turma: TurmaResponseDto) => void
  /** Callback para mostrar detalhes de uma turma */
  onTurmaDetails?: (turma: TurmaResponseDto) => void
  /** Turma atualmente sendo arrastada */
  draggingTurma?: TurmaResponseDto | null
  /** Turma selecionada */
  selectedTurma?: TurmaResponseDto | null
  /** Se deve usar modo compacto nos cards */
  compact?: boolean
}

/**
 * Sidebar component that displays available turmas for allocation
 */
export const TurmasSidebar: React.FC<TurmasSidebarProps> = ({
  periodoLetivoId,
  cursoId,
  onTurmaSelect,
  onTurmaClick,
  onTurmaDetails,
  draggingTurma,
  selectedTurma,
  compact = false,
  className = "",
}) => {
  // Prepare query parameters for API call
  const queryParams: TurmasControllerFindAllParams = {
    idPeriodoLetivo: periodoLetivoId,
    // Note: There's no direct cursoId filter in the API, but we can filter by idPeriodoLetivo
    // If needed, curso filtering would need to be implemented on the backend
  }

  // Fetch turmas data
  const {
    data: turmas = [],
    isLoading,
    error,
  } = useTurmasControllerFindAll(queryParams, {
    query: {
      queryKey: getTurmasControllerFindAllQueryKey(queryParams),
      enabled: !!periodoLetivoId, // Only fetch if periodoLetivoId is provided
    },
  })

  // Filter turmas that don't have schedules allocated yet (basic filter)
  // This is a placeholder - in real implementation, you'd check against existing allocations
  const turmasDisponiveis = turmas.filter((turma) => {
    // Basic availability check - for now, show all turmas
    // TODO: In future, filter out turmas that already have full schedule allocation
    return true
  })

  let errorMessage: string | null = null
  if (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      errorMessage = (error as { message: string }).message
    } else if (typeof error === "string") {
      errorMessage = error
    } else {
      errorMessage = "Erro ao carregar turmas"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-2"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (errorMessage) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Turmas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (turmasDisponiveis.length === 0) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Turmas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 text-center">
          <div className="space-y-2">
            <Users className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground">
              Nenhuma turma disponível para alocação
            </p>
            {!periodoLetivoId && (
              <p className="text-muted-foreground text-xs">
                Selecione um período letivo para ver as turmas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Turmas Disponíveis
          </div>
          <Badge
            variant="secondary"
            className="text-xs"
          >
            {turmasDisponiveis.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-4 pb-4">
          <div className={`space-y-${compact ? "2" : "3"} group`}>
            {turmasDisponiveis.map((turma) => {
              const isDragging = draggingTurma?.id === turma.id
              const isSelected = selectedTurma?.id === turma.id

              return (
                <TurmaCard
                  key={turma.id}
                  turma={turma}
                  isDragging={isDragging}
                  isSelected={isSelected}
                  compact={compact}
                  onClick={onTurmaClick}
                  onDragStart={onTurmaSelect}
                  onDragEnd={() => {
                    // Handle drag end if needed
                  }}
                  onShowDetails={onTurmaDetails}
                />
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default TurmasSidebar
