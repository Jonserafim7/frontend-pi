import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  // User,
  // Lock,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Send,
  Undo,
} from "lucide-react"
import type { PropostaStatus } from "../types/proposta-types"

interface PropostaPermissionsIndicatorProps {
  status: PropostaStatus
  userRole?: "coordenador" | "diretor"
  className?: string
}

/**
 * Componente que exibe indicadores visuais de permissões e status da proposta
 *
 * Mostra badges contextuais baseados no status da proposta e papel do usuário
 */
export function PropostaPermissionsIndicator({
  status,
  userRole = "coordenador",
  className = "",
}: PropostaPermissionsIndicatorProps) {
  const getStatusIndicator = () => {
    switch (status) {
      case "DRAFT":
        return {
          icon: <Edit className="h-3 w-3" />,
          label: "Editável",
          variant: "default" as const,
          color: "text-primary-foreground",
          tooltip:
            "Você pode editar alocações, adicionar turmas e submeter esta proposta",
        }

      case "PENDENTE_APROVACAO":
        return {
          icon: <Clock className="h-3 w-3" />,
          label: userRole === "diretor" ? "Aguardando Análise" : "Em Análise",
          variant: "outline" as const,
          color: "text-accent-foreground",
          tooltip:
            userRole === "diretor" ?
              "Esta proposta está aguardando sua aprovação ou rejeição"
            : "Proposta submetida para análise da direção. Não é possível editar.",
        }

      case "APROVADA":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Grade Oficial",
          variant: "outline" as const,
          color: "text-primary",
          tooltip: "Esta grade foi oficialmente aprovada e está ativa no sistema",
        }

      case "REJEITADA":
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: userRole === "coordenador" ? "Requer Correção" : "Rejeitada",
          variant: "outline" as const,
          color: "text-destructive",
          tooltip:
            userRole === "coordenador" ?
              "Proposta rejeitada. Verifique a justificativa e use 'Reabrir para Edição'"
            : "Esta proposta foi rejeitada",
        }

      default:
        return {
          icon: <Eye className="h-3 w-3" />,
          label: "Visualização",
          variant: "outline" as const,
          color: "text-muted-foreground",
          tooltip: "Modo de visualização",
        }
    }
  }

  const getActionIndicators = () => {
    const indicators = []

    // Indicadores específicos por status e papel do usuário
    if (status === "DRAFT" && userRole === "coordenador") {
      indicators.push({
        icon: <Send className="h-3 w-3" />,
        label: "Pode Submeter",
        variant: "secondary" as const,
        tooltip: "Você pode submeter esta proposta para aprovação",
      })
    }

    if (status === "REJEITADA" && userRole === "coordenador") {
      indicators.push({
        icon: <Undo className="h-3 w-3" />,
        label: "Pode Reabrir",
        variant: "secondary" as const,
        tooltip: "Você pode reabrir esta proposta para edição",
      })
    }

    if (status === "PENDENTE_APROVACAO" && userRole === "diretor") {
      indicators.push({
        icon: <CheckCircle className="h-3 w-3" />,
        label: "Pode Aprovar",
        variant: "secondary" as const,
        tooltip: "Você pode aprovar ou rejeitar esta proposta",
      })
    }

    if (
      ["APROVADA", "REJEITADA", "PENDENTE_APROVACAO"].includes(status) &&
      userRole === "coordenador"
    ) {
      indicators.push({
        icon: <Eye className="h-3 w-3" />,
        label: "Somente Visualização",
        variant: "outline" as const,
        tooltip: "Esta proposta está em modo de visualização apenas",
      })
    }

    return indicators
  }

  const statusIndicator = getStatusIndicator()
  const actionIndicators = getActionIndicators()

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Indicador principal de status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={statusIndicator.variant}
              className={`gap-1 ${statusIndicator.color}`}
            >
              {statusIndicator.icon}
              {statusIndicator.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{statusIndicator.tooltip}</p>
          </TooltipContent>
        </Tooltip>

        {/* Indicadores de ações disponíveis */}
        {actionIndicators.map((indicator, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Badge
                variant={indicator.variant}
                className="gap-1 text-xs"
              >
                {indicator.icon}
                {indicator.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">{indicator.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
