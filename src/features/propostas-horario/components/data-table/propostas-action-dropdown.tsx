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
import { toast } from "sonner"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { PROPOSTA_STATUS_CONFIG } from "../../types/proposta-types"
import { useReopenProposta } from "../../hooks/use-propostas-horario"

interface PropostasActionDropdownProps {
  proposta: PropostaHorarioResponseDto
  userRole: "coordinator" | "director"
}

/**
 * Menu dropdown de ações para propostas de horário
 *
 * Ações para Coordenadores:
 * - Ver Detalhes (sempre disponível - modo visualização)
 * - Editar (apenas se status DRAFT - modo edição)
 * - Reabrir (apenas se status REJEITADA - volta para DRAFT)
 *
 * Ações para Diretores:
 * - Ver Detalhes (sempre disponível)
 */
export function PropostasActionDropdown({
  proposta,
  userRole,
}: PropostasActionDropdownProps) {
  const navigate = useNavigate()
  const reopenPropostaMutation = useReopenProposta()

  const handleViewDetails = () => {
    if (userRole === "coordinator") {
      // Para coordenadores, sempre vai para modo visualização
      navigate(`/coordenador/propostas-horario/${proposta.id}`)
    } else {
      navigate(`/diretor/propostas-horario/${proposta.id}`)
    }
  }

  const handleEdit = () => {
    // Para edição, vai para a mesma página mas a página detecta que é DRAFT e habilita edição
    navigate(`/coordenador/propostas-horario/${proposta.id}`)
  }

  const handleReopen = () => {
    reopenPropostaMutation.mutate(
      { id: proposta.id },
      {
        onSuccess: () => {
          toast.success("Proposta reaberta para edição!")
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Erro ao reabrir proposta",
          )
        },
      },
    )
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
        {/* Ações específicas para coordenadores */}
        {userRole === "coordinator" && (
          <>
            {/* Para propostas DRAFT: Mostrar "Editar" como ação principal */}
            {canEdit ?
              <DropdownMenuItem
                onClick={handleEdit}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Proposta
              </DropdownMenuItem>
            : /* Para outras propostas: Mostrar "Ver Detalhes" */
              <DropdownMenuItem
                onClick={handleViewDetails}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
            }

            {/* Reabrir - apenas para REJEITADA */}
            {canReopen && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleReopen}
                  className="cursor-pointer"
                  disabled={reopenPropostaMutation.isPending}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {reopenPropostaMutation.isPending ?
                    "Reabrindo..."
                  : "Reabrir para Edição"}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {/* Para diretores: apenas Ver Detalhes */}
        {userRole === "director" && (
          <DropdownMenuItem
            onClick={handleViewDetails}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
