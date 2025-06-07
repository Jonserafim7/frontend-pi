import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  GraduationCap,
  Send,
  User,
  XCircle,
} from "lucide-react"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"

interface PropostaCardProps {
  proposta: PropostaHorarioResponseDto
  showCoordenadorActions?: boolean
  showDiretorActions?: boolean
  onView?: (proposta: PropostaHorarioResponseDto) => void
  onEdit?: (proposta: PropostaHorarioResponseDto) => void
  onEnviar?: (proposta: PropostaHorarioResponseDto) => void
  onAprovar?: (proposta: PropostaHorarioResponseDto) => void
  onRejeitar?: (proposta: PropostaHorarioResponseDto) => void
}

const statusConfig = {
  [PropostaHorarioResponseDtoStatus.DRAFT]: {
    label: "Rascunho",
    className: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  [PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO]: {
    label: "Pendente",
    className: "text-blue-700 bg-blue-50 border-blue-200",
  },
  [PropostaHorarioResponseDtoStatus.APROVADA]: {
    label: "Aprovada",
    className: "text-green-700 bg-green-50 border-green-200",
  },
  [PropostaHorarioResponseDtoStatus.REJEITADA]: {
    label: "Rejeitada",
    className: "text-red-700 bg-red-50 border-red-200",
  },
}

export function PropostaCard({
  proposta,
  showCoordenadorActions = false,
  showDiretorActions = false,
  onView,
  onEdit,
  onEnviar,
  onAprovar,
  onRejeitar,
}: PropostaCardProps) {
  const status = statusConfig[proposta.status] || statusConfig.DRAFT
  const isDraft = proposta.status === PropostaHorarioResponseDtoStatus.DRAFT
  const isPending =
    proposta.status === PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO
  const hasAlocacoes = (proposta.alocacoesPropostas?.length || 0) > 0

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{proposta.curso.nome}</CardTitle>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {String(proposta.curso.codigo)}
              </span>
              <span>
                {proposta.periodoLetivo.ano}/{proposta.periodoLetivo.semestre}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-4 w-4" />
            <span>{proposta.coordenadorQueSubmeteu.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>{formatDate(proposta.dataCriacao)}</span>
          </div>
        </div>

        {proposta.justificativaRejeicao && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-900">
              {String(proposta.justificativaRejeicao)}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(proposta)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </Button>
        )}

        {showCoordenadorActions && isDraft && (
          <>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(proposta)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {onEnviar && hasAlocacoes && (
              <Button
                size="sm"
                onClick={() => onEnviar(proposta)}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            )}
          </>
        )}

        {showDiretorActions && isPending && (
          <>
            {onAprovar && (
              <Button
                size="sm"
                onClick={() => onAprovar(proposta)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
            )}
            {onRejeitar && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRejeitar(proposta)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
