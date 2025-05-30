import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertTriangle, AlertCircle, Info, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  ConflictDetails,
  ConflictSeverity,
  ConflictType,
} from "../utils/conflictHandling"

export interface ConflictIndicatorProps {
  /** Conflitos a serem exibidos */
  conflicts: ConflictDetails[]
  /** Tamanho do indicador */
  size?: "sm" | "md" | "lg"
  /** Se deve mostrar apenas o ícone */
  iconOnly?: boolean
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente para exibir indicadores visuais de conflitos
 */
export const ConflictIndicator: React.FC<ConflictIndicatorProps> = ({
  conflicts,
  size = "md",
  iconOnly = false,
  className,
}) => {
  if (conflicts.length === 0) {
    return null
  }

  // Encontrar o conflito de maior severidade
  const highestSeverityConflict = conflicts.reduce((highest, current) => {
    const severityOrder = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    }

    const currentOrder =
      severityOrder[current.severity as keyof typeof severityOrder]
    const highestOrder =
      severityOrder[highest.severity as keyof typeof severityOrder]

    return currentOrder < highestOrder ? current : highest
  })

  // Configurações visuais baseadas na severidade
  const getSeverityConfig = (severity: ConflictSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return {
          icon: AlertTriangle,
          color: "destructive",
          bgColor: "bg-destructive",
          textColor: "text-destructive-foreground",
          borderColor: "border-destructive",
        }
      case "HIGH":
        return {
          icon: AlertCircle,
          color: "destructive",
          bgColor: "bg-orange-500",
          textColor: "text-white",
          borderColor: "border-orange-500",
        }
      case "MEDIUM":
        return {
          icon: Info,
          color: "secondary",
          bgColor: "bg-yellow-500",
          textColor: "text-white",
          borderColor: "border-yellow-500",
        }
      case "LOW":
        return {
          icon: Info,
          color: "outline",
          bgColor: "bg-blue-500",
          textColor: "text-white",
          borderColor: "border-blue-500",
        }
      default:
        return {
          icon: Info,
          color: "secondary",
          bgColor: "bg-gray-500",
          textColor: "text-white",
          borderColor: "border-gray-500",
        }
    }
  }

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      iconSize: "w-3 h-3",
      badgeSize: "text-xs",
      containerSize: "w-4 h-4",
    },
    md: {
      iconSize: "w-4 h-4",
      badgeSize: "text-sm",
      containerSize: "w-5 h-5",
    },
    lg: {
      iconSize: "w-5 h-5",
      badgeSize: "text-base",
      containerSize: "w-6 h-6",
    },
  }

  const config = getSeverityConfig(highestSeverityConflict.severity)
  const sizes = sizeConfig[size]
  const Icon = config.icon

  // Conteúdo do tooltip
  const tooltipContent = (
    <div className="max-w-xs space-y-2">
      <div className="font-semibold">
        {conflicts.length} conflito{conflicts.length > 1 ? "s" : ""} detectado
        {conflicts.length > 1 ? "s" : ""}
      </div>
      {conflicts.slice(0, 3).map((conflict, index) => (
        <div
          key={conflict.id}
          className="text-sm"
        >
          <div className="font-medium">{conflict.description}</div>
          {conflict.suggestions.length > 0 && (
            <div className="text-muted-foreground mt-1 text-xs">
              Sugestão: {conflict.suggestions[0]}
            </div>
          )}
        </div>
      ))}
      {conflicts.length > 3 && (
        <div className="text-muted-foreground text-xs">
          +{conflicts.length - 3} conflito{conflicts.length - 3 > 1 ? "s" : ""}{" "}
          adicional{conflicts.length - 3 > 1 ? "is" : ""}
        </div>
      )}
    </div>
  )

  if (iconOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative flex items-center justify-center rounded-full",
                config.bgColor,
                sizes.containerSize,
                className,
              )}
            >
              <Icon className={cn(sizes.iconSize, config.textColor)} />
              {conflicts.length > 1 && (
                <div className="bg-background absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full border border-current">
                  <span className="text-foreground text-xs font-bold">
                    {conflicts.length > 9 ? "9+" : conflicts.length}
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.color as any}
            className={cn("flex items-center gap-1", sizes.badgeSize, className)}
          >
            <Icon className={sizes.iconSize} />
            {conflicts.length} conflito{conflicts.length > 1 ? "s" : ""}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Componente para exibir lista detalhada de conflitos
 */
export interface ConflictListProps {
  /** Conflitos a serem exibidos */
  conflicts: ConflictDetails[]
  /** Callback quando um conflito é selecionado */
  onConflictSelect?: (conflict: ConflictDetails) => void
  /** Classe CSS adicional */
  className?: string
}

export const ConflictList: React.FC<ConflictListProps> = ({
  conflicts,
  onConflictSelect,
  className,
}) => {
  if (conflicts.length === 0) {
    return (
      <div className={cn("text-muted-foreground py-4 text-center", className)}>
        Nenhum conflito detectado
      </div>
    )
  }

  const getSeverityIcon = (severity: ConflictSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="text-destructive h-4 w-4" />
      case "HIGH":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "MEDIUM":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "LOW":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: ConflictType) => {
    switch (type) {
      case "PROFESSOR_OVERLAP":
        return "Professor"
      case "TURMA_OVERLAP":
        return "Turma"
      case "SLOT_OVERLAP":
        return "Horário"
      case "CARGA_HORARIA_EXCEEDED":
        return "Carga Horária"
      default:
        return "Desconhecido"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {conflicts.map((conflict) => (
        <div
          key={conflict.id}
          className={cn(
            "cursor-pointer rounded-lg border p-3 transition-colors",
            "hover:bg-muted/50",
            onConflictSelect && "hover:border-primary/50",
          )}
          onClick={() => onConflictSelect?.(conflict)}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(conflict.severity)}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium">
                  {conflict.description}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {getTypeLabel(conflict.type)}
                </Badge>
                {conflict.canAutoResolve && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    Auto-resolvível
                  </Badge>
                )}
              </div>

              {conflict.suggestions.length > 0 && (
                <div className="text-muted-foreground text-xs">
                  <strong>Sugestão:</strong> {conflict.suggestions[0]}
                </div>
              )}

              <div className="text-muted-foreground mt-1 text-xs">
                Afeta {conflict.alocacoes.length} alocação
                {conflict.alocacoes.length > 1 ? "ões" : ""}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ConflictIndicator
