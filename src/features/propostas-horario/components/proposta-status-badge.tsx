import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PROPOSTA_STATUS_CONFIG } from "../types/proposta-types"
import type { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"

interface PropostaStatusBadgeProps {
  status: PropostaHorarioResponseDtoStatus
  className?: string
  showDescription?: boolean
}

/**
 * Badge visual para status da proposta com cores específicas:
 * - DRAFT: azul
 * - PENDENTE_APROVACAO: amarelo
 * - APROVADA: verde
 * - REJEITADA: vermelho
 */
export function PropostaStatusBadge({
  status,
  className,
  showDescription = false,
}: PropostaStatusBadgeProps) {
  const statusConfig = PROPOSTA_STATUS_CONFIG[status]

  // Cores específicas para cada status conforme especificação
  const getStatusColors = (status: PropostaHorarioResponseDtoStatus) => {
    switch (status) {
      case "DRAFT":
        return "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
      case "PENDENTE_APROVACAO":
        return "border-chart-2/30 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
      case "APROVADA":
        return "border-accent/30 bg-accent/10 text-accent-foreground hover:bg-accent/20"
      case "REJEITADA":
        return "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
      default:
        return "border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-50"
    }
  }

  const statusColors = getStatusColors(status)

  if (showDescription) {
    return (
      <div className="flex flex-col">
        <Badge
          variant="outline"
          className={cn("w-fit", statusColors, className)}
        >
          {statusConfig.label}
        </Badge>
        <div className="text-muted-foreground mt-1 text-xs">
          {statusConfig.description}
        </div>
      </div>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn("w-fit", statusColors, className)}
    >
      {statusConfig.label}
    </Badge>
  )
}
