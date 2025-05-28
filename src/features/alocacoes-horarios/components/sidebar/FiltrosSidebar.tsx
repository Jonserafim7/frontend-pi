import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  Filter,
  Calendar,
  BookOpen,
  User,
  X,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

// Import API hooks using path aliases
import {
  usePeriodosLetivosControllerFindAll,
  getPeriodosLetivosControllerFindAllQueryKey,
} from "@/api-generated/client/períodos-letivos/períodos-letivos"
import {
  useCursosControllerFindAll,
  getCursosControllerFindAllQueryKey,
} from "@/api-generated/client/cursos/cursos"
import {
  useUsuariosControllerFindAll,
  getUsuariosControllerFindAllQueryKey,
} from "@/api-generated/client/usuarios/usuarios"

// Import types
import type { PeriodoLetivoResponseDto } from "@/api-generated/model/periodo-letivo-response-dto"
import type { CursoResponseDto } from "@/api-generated/model/curso-response-dto"
import type { UsuarioResponseDto } from "@/api-generated/model/usuario-response-dto"
import type { ComponentWithBaseProps } from "../../types"

export interface FiltrosState {
  periodoLetivoId?: string
  cursoId?: string
  professorId?: string
  turno?: string[]
  statusAlocacao?: string[]
}

interface FiltrosSidebarProps extends ComponentWithBaseProps {
  /** Estado atual dos filtros */
  filtros: FiltrosState
  /** Callback quando os filtros mudam */
  onFiltrosChange: (filtros: FiltrosState) => void
  /** Se deve usar modo compacto */
  compact?: boolean
  /** Se deve mostrar contador de resultados */
  showResultCount?: boolean
  /** Contador de resultados filtrados */
  resultCount?: number
}

/**
 * Sidebar component with filters for schedule allocation view
 */
export const FiltrosSidebar: React.FC<FiltrosSidebarProps> = ({
  filtros,
  onFiltrosChange,
  compact = false,
  showResultCount = false,
  resultCount,
  className = "",
}) => {
  // Fetch períodos letivos
  const {
    data: periodosLetivos = [],
    isLoading: isLoadingPeriodos,
    error: errorPeriodos,
  } = usePeriodosLetivosControllerFindAll(
    {},
    {
      query: {
        queryKey: getPeriodosLetivosControllerFindAllQueryKey({}),
      },
    },
  )

  // Fetch cursos
  const {
    data: cursos = [],
    isLoading: isLoadingCursos,
    error: errorCursos,
  } = useCursosControllerFindAll({
    query: {
      queryKey: getCursosControllerFindAllQueryKey(),
    },
  })

  // Fetch professores
  const {
    data: usuarios = [],
    isLoading: isLoadingProfessores,
    error: errorProfessores,
  } = useUsuariosControllerFindAll(
    { papel: "PROFESSOR" },
    {
      query: {
        queryKey: getUsuariosControllerFindAllQueryKey({ papel: "PROFESSOR" }),
      },
    },
  )

  const professores = usuarios.filter((user) => user.papel === "PROFESSOR")

  // Helper functions
  const handlePeriodoChange = (periodoId: string) => {
    onFiltrosChange({
      ...filtros,
      periodoLetivoId: periodoId === "all" ? undefined : periodoId,
    })
  }

  const handleCursoChange = (cursoId: string) => {
    onFiltrosChange({
      ...filtros,
      cursoId: cursoId === "all" ? undefined : cursoId,
    })
  }

  const handleProfessorChange = (professorId: string) => {
    onFiltrosChange({
      ...filtros,
      professorId: professorId === "all" ? undefined : professorId,
    })
  }

  const handleTurnoChange = (turno: string, checked: boolean) => {
    const currentTurnos = filtros.turno || []
    let newTurnos: string[]

    if (checked) {
      newTurnos = [...currentTurnos, turno]
    } else {
      newTurnos = currentTurnos.filter((t) => t !== turno)
    }

    onFiltrosChange({
      ...filtros,
      turno: newTurnos.length > 0 ? newTurnos : undefined,
    })
  }

  const handleStatusAlocacaoChange = (status: string, checked: boolean) => {
    const currentStatus = filtros.statusAlocacao || []
    let newStatus: string[]

    if (checked) {
      newStatus = [...currentStatus, status]
    } else {
      newStatus = currentStatus.filter((s) => s !== status)
    }

    onFiltrosChange({
      ...filtros,
      statusAlocacao: newStatus.length > 0 ? newStatus : undefined,
    })
  }

  const handleClearFilters = () => {
    onFiltrosChange({})
  }

  const hasActiveFilters = Boolean(
    filtros.periodoLetivoId ||
      filtros.cursoId ||
      filtros.professorId ||
      (filtros.turno && filtros.turno.length > 0) ||
      (filtros.statusAlocacao && filtros.statusAlocacao.length > 0),
  )

  const isLoading = isLoadingPeriodos || isLoadingCursos || isLoadingProfessores
  const hasErrors = errorPeriodos || errorCursos || errorProfessores

  // Validation helper
  const isValidFilterState = () => {
    // Período letivo é obrigatório para mostrar resultados
    return Boolean(filtros.periodoLetivoId)
  }

  // Get active filter labels
  const getActiveFilterLabels = () => {
    const labels = []

    if (filtros.periodoLetivoId) {
      const periodo = periodosLetivos.find(
        (p) => p.id === filtros.periodoLetivoId,
      )
      if (periodo) {
        labels.push(`${periodo.ano}.${periodo.semestre}`)
      }
    }

    if (filtros.cursoId) {
      const curso = cursos.find((c) => c.id === filtros.cursoId)
      if (curso) {
        labels.push(curso.codigo)
      }
    }

    if (filtros.professorId) {
      const professor = professores.find((p) => p.id === filtros.professorId)
      if (professor) {
        labels.push(professor.nome.split(" ")[0])
      }
    }

    if (filtros.turno && filtros.turno.length > 0) {
      labels.push(`Turno: ${filtros.turno.length}`)
    }

    if (filtros.statusAlocacao && filtros.statusAlocacao.length > 0) {
      labels.push(`Status: ${filtros.statusAlocacao.length}`)
    }

    return labels
  }

  const activeFilterLabels = getActiveFilterLabels()

  // Turno options
  const turnoOptions = [
    { value: "MATUTINO", label: "Matutino", icon: "☀️" },
    { value: "VESPERTINO", label: "Vespertino", icon: "🌅" },
    { value: "NOTURNO", label: "Noturno", icon: "🌙" },
  ]

  // Status de alocação options
  const statusAlocacaoOptions = [
    {
      value: "ALOCADA",
      label: "Alocadas",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "NAO_ALOCADA",
      label: "Não Alocadas",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      value: "CONFLITO",
      label: "Com Conflitos",
      icon: AlertCircle,
      color: "text-red-600",
    },
  ]

  return (
    <Card className={`${compact ? "w-72" : "w-80"} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className={compact ? "text-sm" : "text-base"}>Filtros</span>
          </div>
          <div className="flex items-center gap-2">
            {showResultCount && typeof resultCount === "number" && (
              <Badge
                variant={isValidFilterState() ? "secondary" : "destructive"}
                className="text-xs"
              >
                {resultCount}
              </Badge>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 w-6 p-0"
                title="Limpar filtros"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>

        {/* Validation warning */}
        {!isValidFilterState() && !isLoading && (
          <Alert
            variant="default"
            className="mt-2"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Selecione um período letivo para filtrar turmas
            </AlertDescription>
          </Alert>
        )}

        {/* Active filters display */}
        {activeFilterLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {activeFilterLabels.map((label, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs"
              >
                {label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="space-y-2"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {hasErrors && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar opções de filtros
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        {!isLoading && !hasErrors && (
          <div className="space-y-4">
            {/* Período Letivo Filter - Required */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <label className="text-sm font-medium">
                  Período Letivo <span className="text-red-500">*</span>
                </label>
              </div>
              <Select
                value={filtros.periodoLetivoId || "all"}
                onValueChange={handlePeriodoChange}
              >
                <SelectTrigger className={compact ? "h-8 text-xs" : "h-9"}>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  {periodosLetivos.map((periodo) => (
                    <SelectItem
                      key={periodo.id}
                      value={periodo.id}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span>
                          {periodo.ano}.{periodo.semestre}
                        </span>
                        {periodo.status === "ATIVO" && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs"
                          >
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Curso Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-4 w-4" />
                <label className="text-sm font-medium">Curso</label>
              </div>
              <Select
                value={filtros.cursoId || "all"}
                onValueChange={handleCursoChange}
              >
                <SelectTrigger className={compact ? "h-8 text-xs" : "h-9"}>
                  <SelectValue placeholder="Todos os cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {cursos.map((curso) => (
                    <SelectItem
                      key={curso.id}
                      value={curso.id}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{curso.codigo}</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {curso.nome}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Professor Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <label className="text-sm font-medium">Professor</label>
              </div>
              <Select
                value={filtros.professorId || "all"}
                onValueChange={handleProfessorChange}
              >
                <SelectTrigger className={compact ? "h-8 text-xs" : "h-9"}>
                  <SelectValue placeholder="Todos os professores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os professores</SelectItem>
                  {professores.map((professor) => (
                    <SelectItem
                      key={professor.id}
                      value={professor.id}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {professor.nome.split(" ").slice(0, 2).join(" ")}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {professor.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Turno Filter - Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <label className="text-sm font-medium">Turno</label>
              </div>
              <div className="space-y-2">
                {turnoOptions.map((turno) => (
                  <div
                    key={turno.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`turno-${turno.value}`}
                      checked={filtros.turno?.includes(turno.value) || false}
                      onCheckedChange={(checked) =>
                        handleTurnoChange(turno.value, checked as boolean)
                      }
                      className={compact ? "h-3 w-3" : "h-4 w-4"}
                    />
                    <Label
                      htmlFor={`turno-${turno.value}`}
                      className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"} cursor-pointer`}
                    >
                      <span>{turno.icon}</span>
                      {turno.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status de Alocação Filter - Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-muted-foreground h-4 w-4" />
                <label className="text-sm font-medium">Status</label>
              </div>
              <div className="space-y-2">
                {statusAlocacaoOptions.map((status) => {
                  const IconComponent = status.icon
                  return (
                    <div
                      key={status.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={
                          filtros.statusAlocacao?.includes(status.value) || false
                        }
                        onCheckedChange={(checked) =>
                          handleStatusAlocacaoChange(
                            status.value,
                            checked as boolean,
                          )
                        }
                        className={compact ? "h-3 w-3" : "h-4 w-4"}
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"} cursor-pointer`}
                      >
                        <IconComponent className={`h-3 w-3 ${status.color}`} />
                        {status.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FiltrosSidebar
