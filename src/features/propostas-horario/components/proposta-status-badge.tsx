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
        return "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-50"
      case "PENDENTE_APROVACAO":
        return "border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-50"
      case "APROVADA":
        return "border-green-200 bg-green-100 text-green-800 hover:bg-green-50"
      case "REJEITADA":
        return "border-red-200 bg-red-100 text-red-800 hover:bg-red-50"
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
