import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, RotateCcw } from "lucide-react"
import { useNavigate } from "react-router"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { PROPOSTA_STATUS_CONFIG } from "../../types/proposta-types"

interface PropostasActionDropdownProps {
  proposta: PropostaHorarioResponseDto
  userRole: "coordinator" | "director"
}

/**
 * Menu dropdown de ações para propostas de horário
 *
 * Ações para Coordenadores:
 * - Ver Detalhes (sempre disponível)
 * - Editar (apenas se status DRAFT)
 * - Reabrir (apenas se status REJEITADA)
 *
 * Ações para Diretores:
 * - Ver Detalhes (sempre disponível)
 */
export function PropostasActionDropdown({
  proposta,
  userRole,
}: PropostasActionDropdownProps) {
  const navigate = useNavigate()
  const statusConfig = PROPOSTA_STATUS_CONFIG[proposta.status]

  const handleViewDetails = () => {
    if (userRole === "coordinator") {
      navigate(`/coordenador/propostas-horario/${proposta.id}`)
    } else {
      navigate(`/diretor/propostas-horario/${proposta.id}`)
    }
  }

  const handleEdit = () => {
    navigate(`/coordenador/propostas-horario/${proposta.id}`)
  }

  const handleReopen = () => {
    // TODO: Implementar ação de reabertura na task 5.5
    console.log("Reabrir proposta:", proposta.id)
  }

  // Verificar permissões baseadas no status
  const canEdit = proposta.status === "DRAFT"
  const canReopen = proposta.status === "REJEITADA"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label="Abrir menu de ações"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
      >
        {/* Ação sempre disponível: Ver Detalhes */}
        <DropdownMenuItem
          onClick={handleViewDetails}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalhes
        </DropdownMenuItem>

        {/* Ações específicas para coordenadores */}
        {userRole === "coordinator" && (
          <>
            {/* Editar - apenas para DRAFT */}
            {canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              </>
            )}

            {/* Reabrir - apenas para REJEITADA */}
            {canReopen && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleReopen}
                  className="cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reabrir para Edição
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
