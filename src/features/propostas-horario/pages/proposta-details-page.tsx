import { HeaderIconContainer } from "@/components/icon-container"
import {
  CalendarDays,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  User,
  Send,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useParams, useNavigate } from "react-router"
import {
  usePropostaHorario,
  useReopenProposta,
} from "../hooks/use-propostas-horario"
import { PropostaStatusBadge } from "../components/proposta-status-badge"
import { PropostaScheduleGrid } from "../components/alocacao-turmas-horarios/proposta-schedule-grid"
import { PropostaPermissionsIndicator } from "../components/proposta-permissions-indicator"
import { SubmitPropostaDialog } from "../components/submit-proposta-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Lock, CheckCircle, XCircle } from "lucide-react"

/**
 * Página de detalhes/edição de uma proposta de horário
 * Permite visualizar e editar propostas baseado no status
 */
export function PropostaDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: proposta, isLoading, error } = usePropostaHorario(id!)
  const reopenPropostaMutation = useReopenProposta()

  const handleBack = () => {
    navigate("/coordenador/propostas-horario")
  }

  const handleReopen = async () => {
    if (!proposta) return

    try {
      await reopenPropostaMutation.mutateAsync({ id: proposta.id })
      // Os dados serão atualizados automaticamente via React Query
    } catch (error) {
      console.error("Erro ao reabrir proposta:", error)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Erro</h1>
            <p className="text-muted-foreground">
              Não foi possível carregar a proposta
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à Lista
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-destructive">
              {error?.message || "Erro ao carregar os dados da proposta"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 p-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {isLoading ? "Carregando..." : "Detalhes da Proposta"}
              </h1>
              {proposta && (
                <PropostaStatusBadge
                  status={proposta.status}
                  showDescription={false}
                />
              )}
            </div>
            {proposta && (
              <p className="text-muted-foreground">
                {proposta.curso.nome} - {proposta.periodoLetivo.ano}/
                {proposta.periodoLetivo.semestre}º Semestre
              </p>
            )}
          </div>
        </div>

        {/* Indicadores de Permissões no Header */}
        {proposta && (
          <PropostaPermissionsIndicator
            status={proposta.status}
            userRole="coordenador" // TODO: Obter do contexto de auth
          />
        )}
      </div>

      {/* Botões de Ação - Task 4.4, 4.8, 4.9 */}
      {proposta && (
        <div className="flex items-center justify-between">
          {/* Botão Voltar */}
          <Button
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft />
            Voltar à Lista
          </Button>

          {/* Botões Condicionais baseados no Status */}
          <div className="flex gap-3">
            {/* Botão Submeter - Task 4.4 */}
            {proposta.status === "DRAFT" && (
              <SubmitPropostaDialog
                propostaId={proposta.id}
                quantidadeAlocacoes={proposta.quantidadeAlocacoes || 0}
              >
                <Button>
                  <Send />
                  Submeter Proposta
                </Button>
              </SubmitPropostaDialog>
            )}

            {/* Botão Reabrir - Task 4.8 */}
            {proposta.status === "REJEITADA" && (
              <Button
                onClick={handleReopen}
                disabled={reopenPropostaMutation.isPending}
                className="bg-chart-2 hover:bg-chart-2/90 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {reopenPropostaMutation.isPending ?
                  "Reabrindo..."
                : "Reabrir para Edição"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Cards de Informações */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card do Curso */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <BookOpen className="text-primary mr-2 h-5 w-5" />
            <CardTitle className="text-lg">Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ?
              <>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </>
            : <>
                <p className="font-semibold">{proposta?.curso.nome}</p>
                {proposta?.curso.codigo && (
                  <p className="text-muted-foreground text-sm">
                    Código: {String(proposta.curso.codigo)}
                  </p>
                )}
              </>
            }
          </CardContent>
        </Card>

        {/* Card do Período Letivo */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Calendar className="text-primary mr-2 h-5 w-5" />
            <CardTitle className="text-lg">Período Letivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ?
              <>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </>
            : <>
                <p className="font-semibold">
                  {proposta?.periodoLetivo.ano}/{proposta?.periodoLetivo.semestre}
                  º Semestre
                </p>
                <p className="text-muted-foreground text-sm">
                  {new Date(
                    proposta?.periodoLetivo.dataInicio!,
                  ).toLocaleDateString("pt-BR")}{" "}
                  -{" "}
                  {new Date(proposta?.periodoLetivo.dataFim!).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </>
            }
          </CardContent>
        </Card>

        {/* Card do Status */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Clock className="text-primary mr-2 h-5 w-5" />
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ?
              <>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </>
            : <>
                <PropostaStatusBadge
                  status={proposta?.status!}
                  showDescription={true}
                />
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Alocações:</span>{" "}
                    {proposta?.quantidadeAlocacoes || 0}
                  </p>
                </div>
              </>
            }
          </CardContent>
        </Card>
      </div>

      {/* Card de Datas e Coordenador */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ?
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </>
            : <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criada em:</span>
                  <span>
                    {new Date(proposta?.dataCriacao!).toLocaleDateString("pt-BR")}{" "}
                    às{" "}
                    {new Date(proposta?.dataCriacao!).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>

                {proposta?.dataSubmissao && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submetida em:</span>
                    <span>
                      {new Date(proposta.dataSubmissao).toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                      às{" "}
                      {new Date(proposta.dataSubmissao).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                )}

                {proposta?.dataAprovacaoRejeicao && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {proposta.status === "APROVADA" ?
                        "Aprovada em:"
                      : "Rejeitada em:"}
                    </span>
                    <span>
                      {new Date(
                        proposta.dataAprovacaoRejeicao,
                      ).toLocaleDateString("pt-BR")}{" "}
                      às{" "}
                      {new Date(
                        proposta.dataAprovacaoRejeicao,
                      ).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Última atualização:
                  </span>
                  <span>
                    {new Date(proposta?.dataAtualizacao!).toLocaleDateString(
                      "pt-BR",
                    )}{" "}
                    às{" "}
                    {new Date(proposta?.dataAtualizacao!).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </>
            }
          </CardContent>
        </Card>

        {/* Card do Coordenador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="text-primary h-5 w-5" />
              Coordenação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ?
              <>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </>
            : <>
                <div>
                  <p className="font-semibold">
                    {proposta?.coordenadorQueSubmeteu?.nome}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {proposta?.coordenadorQueSubmeteu?.email}
                  </p>
                </div>

                {proposta?.observacoesCoordenador && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Observações:</p>
                    <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-sm">
                      {String(proposta.observacoesCoordenador)}
                    </p>
                  </div>
                )}

                {proposta?.justificativaRejeicao && (
                  <div>
                    <p className="text-destructive mb-1 text-sm font-medium">
                      Justificativa da Rejeição:
                    </p>
                    <p className="text-destructive bg-destructive/10 rounded-md p-2 text-sm">
                      {String(proposta.justificativaRejeicao)}
                    </p>
                  </div>
                )}

                {proposta?.observacoesDiretor && (
                  <div>
                    <p className="mb-1 text-sm font-medium">
                      Observações do Diretor:
                    </p>
                    <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-sm">
                      {String(proposta.observacoesDiretor)}
                    </p>
                  </div>
                )}
              </>
            }
          </CardContent>
        </Card>
      </div>

      {/* Indicador Visual de Modo Read-only e Justificativa - Task 4.6, 4.7 */}
      {proposta && proposta.status !== "DRAFT" && (
        <div className="space-y-4">
          <Alert className="border-muted-foreground/30">
            <div className="flex items-center gap-2">
              {proposta.status === "APROVADA" ?
                <>
                  <CheckCircle className="text-accent-foreground h-4 w-4" />
                  <Eye className="h-4 w-4" />
                </>
              : proposta.status === "REJEITADA" ?
                <>
                  <XCircle className="text-destructive h-4 w-4" />
                  <Eye className="h-4 w-4" />
                </>
              : <>
                  <Lock className="text-chart-2 h-4 w-4" />
                  <Eye className="h-4 w-4" />
                </>
              }
            </div>
            <AlertDescription className="ml-8">
              {proposta.status === "APROVADA" && (
                <span>
                  <strong>Proposta Aprovada:</strong> Esta grade de horários foi
                  oficialmente aprovada e está em modo de visualização apenas.
                  Nenhuma alteração pode ser feita.
                </span>
              )}
              {proposta.status === "REJEITADA" && (
                <span>
                  <strong>Proposta Rejeitada:</strong> Esta proposta foi rejeitada
                  pela direção e está em modo de visualização. Use o botão
                  "Reabrir para Edição" para criar uma nova versão.
                </span>
              )}
              {proposta.status === "PENDENTE_APROVACAO" && (
                <span>
                  <strong>Aguardando Aprovação:</strong> Esta proposta está sendo
                  analisada pela direção e não pode ser modificada neste momento.
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Alert de Justificativa de Rejeição - Task 4.7 */}
          {proposta.status === "REJEITADA" && proposta.justificativaRejeicao && (
            <Alert className="border-destructive/30 bg-destructive/10">
              <XCircle className="text-destructive h-4 w-4" />
              <AlertDescription className="ml-6">
                <div className="space-y-2">
                  <p className="text-destructive font-semibold">
                    Motivo da Rejeição:
                  </p>
                  <p className="bg-destructive/20 text-destructive rounded p-3 text-sm">
                    {String(proposta.justificativaRejeicao)}
                  </p>
                  {proposta.observacoesDiretor && (
                    <>
                      <p className="text-destructive mt-3 font-semibold">
                        Observações do Diretor:
                      </p>
                      <p className="bg-destructive/20 text-destructive rounded p-3 text-sm">
                        {String(proposta.observacoesDiretor)}
                      </p>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Grade de Horários da Proposta */}
      {proposta && (
        <PropostaScheduleGrid
          propostaId={proposta.id}
          readonly={proposta.status !== "DRAFT"}
        />
      )}
    </div>
  )
}
