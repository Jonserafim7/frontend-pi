import { useState } from "react"
import { format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  Eye,
  GraduationCap,
  MoreVertical,
  Send,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"

interface PropostaCardProps {
  /** Dados da proposta */
  proposta: PropostaHorarioResponseDto
  /** Se deve exibir ações de coordenador */
  showCoordenadorActions?: boolean
  /** Se deve exibir ações de diretor */
  showDiretorActions?: boolean
  /** Callback para visualizar proposta */
  onView?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para editar proposta */
  onEdit?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para enviar proposta */
  onEnviar?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para aprovar proposta */
  onAprovar?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para rejeitar proposta */
  onRejeitar?: (proposta: PropostaHorarioResponseDto) => void
  /** Callback para excluir proposta */
  onDelete?: (proposta: PropostaHorarioResponseDto) => void
  /** Se o card está em modo compacto */
  compact?: boolean
}

/**
 * Componente para exibir uma proposta de horário individual.
 *
 * Características:
 * - Badge de status com cores distintas
 * - Informações principais da proposta
 * - Porcentagem de completude baseada nas alocações
 * - Botões de ação contextuais por papel (coordenador/diretor)
 * - Menu dropdown para ações secundárias
 * - Suporte a modo compacto
 */
export function PropostaCard({
  proposta,
  showCoordenadorActions = false,
  showDiretorActions = false,
  onView,
  onEdit,
  onEnviar,
  onAprovar,
  onRejeitar,
  onDelete,
  compact = false,
}: PropostaCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Configurações de status para badges e ações
   */
  const statusConfig = {
    [PropostaHorarioResponseDtoStatus.DRAFT]: {
      label: "Rascunho",
      variant: "secondary" as const,
      color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    },
    [PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO]: {
      label: "Pendente",
      variant: "default" as const,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    [PropostaHorarioResponseDtoStatus.APROVADA]: {
      label: "Aprovada",
      variant: "default" as const,
      color: "text-green-700 bg-green-50 border-green-200",
    },
    [PropostaHorarioResponseDtoStatus.REJEITADA]: {
      label: "Rejeitada",
      variant: "destructive" as const,
      color: "text-red-700 bg-red-50 border-red-200",
    },
  }

  const status = statusConfig[proposta.status] || statusConfig.DRAFT

  /**
   * Calcula porcentagem de completude baseada nas alocações
   */
  const getCompletionPercentage = (): number => {
    const totalAlocacoes = proposta.alocacoesPropostas?.length || 0
    if (totalAlocacoes === 0) return 0

    // Estimativa: 40 alocações seria um curso completo (8 slots * 5 dias)
    const expectedTotal = 40
    return Math.min(Math.round((totalAlocacoes / expectedTotal) * 100), 100)
  }

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—"

    const date = new Date(dateString)
    if (!isValid(date)) return "—"

    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  /**
   * Formata data com hora para exibição
   */
  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "—"

    const date = new Date(dateString)
    if (!isValid(date)) return "—"

    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  /**
   * Handlers para ações
   */
  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      await action()
    } catch (error) {
      console.error("Erro na ação:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className={compact ? "text-lg" : "text-xl"}>
                {proposta.curso.nome}
              </CardTitle>
              <Badge
                variant={status.variant}
                className={status.color}
              >
                {status.label}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {String(proposta.curso.codigo)} • {proposta.periodoLetivo.ano}/
              {proposta.periodoLetivo.semestre}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(proposta)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
              )}

              {showCoordenadorActions &&
                proposta.status === PropostaHorarioResponseDtoStatus.DRAFT && (
                  <>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(proposta)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(proposta)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="space-y-4">
          {/* Informações de completude */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completude</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="bg-secondary h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Coordenador</span>
              </div>
              <p className="font-medium">
                {proposta.coordenadorQueSubmeteu.nome}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Criação</span>
              </div>
              <p className="font-medium">{formatDate(proposta.dataCriacao)}</p>
            </div>

            {proposta.dataSubmissao && (
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Submissão</span>
                </div>
                <p className="font-medium">
                  {formatDateTime(String(proposta.dataSubmissao))}
                </p>
              </div>
            )}

            {proposta.dataAprovacaoRejeicao && (
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {(
                      proposta.status ===
                      PropostaHorarioResponseDtoStatus.APROVADA
                    ) ?
                      "Aprovação"
                    : "Rejeição"}
                  </span>
                </div>
                <p className="font-medium">
                  {formatDateTime(String(proposta.dataAprovacaoRejeicao))}
                </p>
              </div>
            )}
          </div>

          {/* Observações */}
          {(proposta.observacoesCoordenador ||
            proposta.observacoesDiretor ||
            proposta.justificativaRejeicao) && (
            <div className="space-y-2">
              {proposta.observacoesCoordenador && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Observações do Coordenador
                  </p>
                  <p className="text-sm">
                    {String(proposta.observacoesCoordenador)}
                  </p>
                </div>
              )}

              {proposta.observacoesDiretor && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="mb-1 text-sm font-medium text-blue-700">
                    Observações do Diretor
                  </p>
                  <p className="text-sm text-blue-900">
                    {String(proposta.observacoesDiretor)}
                  </p>
                </div>
              )}

              {proposta.justificativaRejeicao && (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="mb-1 text-sm font-medium text-red-700">
                    Justificativa da Rejeição
                  </p>
                  <p className="text-sm text-red-900">
                    {String(proposta.justificativaRejeicao)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className={`flex ${compact ? "pt-3" : ""} gap-2`}>
        {/* Ações principais */}
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(proposta)}
            disabled={isLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            {compact ? "Ver" : "Visualizar"}
          </Button>
        )}

        {/* Ações de coordenador */}
        {showCoordenadorActions &&
          proposta.status === PropostaHorarioResponseDtoStatus.DRAFT && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(() => onEdit(proposta))}
                  disabled={isLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}

              {onEnviar && completionPercentage > 0 && (
                <Button
                  size="sm"
                  onClick={() => handleAction(() => onEnviar(proposta))}
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
              )}
            </>
          )}

        {/* Ações de diretor */}
        {showDiretorActions &&
          proposta.status ===
            PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO && (
            <>
              {onAprovar && (
                <Button
                  size="sm"
                  onClick={() => handleAction(() => onAprovar(proposta))}
                  disabled={isLoading}
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
                  onClick={() => handleAction(() => onRejeitar(proposta))}
                  disabled={isLoading}
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
