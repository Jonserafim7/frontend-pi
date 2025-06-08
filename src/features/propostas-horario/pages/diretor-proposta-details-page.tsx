import { HeaderIconContainer } from "@/components/icon-container"
import {
  CalendarCheck,
  ArrowLeft,
  CheckCircle,
  XCircle,
  BookOpen,
  Calendar,
  Clock,
  User,
  Eye,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useParams, useNavigate } from "react-router"
import { usePropostaHorario } from "../hooks/use-propostas-horario"
import { PropostaStatusBadge } from "../components/proposta-status-badge"
import { PropostaScheduleGrid } from "../components/alocacao-turmas-horarios/proposta-schedule-grid"
import {
  ApprovePropostaDialog,
  RejectPropostaDialog,
} from "../components/approve-reject-dialogs"

/**
 * Página de detalhes de uma proposta de horário para diretores
 * Permite visualizar propostas e executar ações de aprovação/rejeição
 * Task 6.6: Página para diretores com botões de aprovação/rejeição
 */
export function DiretorPropostaDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: proposta, isLoading, error } = usePropostaHorario(id!)

  const handleBack = () => {
    navigate("/diretor/propostas-horario")
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarCheck} />
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
          <HeaderIconContainer Icon={CalendarCheck} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {isLoading ? "Carregando..." : "Análise de Proposta"}
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
      </div>

      {/* Botões de Ação para Diretores */}
      {proposta && (
        <div className="flex items-center justify-between">
          {/* Botão Voltar */}
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à Lista
          </Button>

          {/* Botões de Aprovação/Rejeição - apenas para PENDENTE */}
          {proposta.status === "PENDENTE_APROVACAO" && (
            <div className="flex gap-3">
              <ApprovePropostaDialog
                propostaId={proposta.id}
                cursoNome={proposta.curso.nome}
                coordenadorNome={proposta.coordenadorQueSubmeteu.nome}
              >
                <Button className="bg-accent hover:bg-accent/90 gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Aprovar Proposta
                </Button>
              </ApprovePropostaDialog>

              <RejectPropostaDialog
                propostaId={proposta.id}
                cursoNome={proposta.curso.nome}
                coordenadorNome={proposta.coordenadorQueSubmeteu.nome}
              >
                <Button
                  variant="destructive"
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar Proposta
                </Button>
              </RejectPropostaDialog>
            </div>
          )}
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
                    <p className="mb-1 text-sm font-medium">
                      Observações do Coordenador:
                    </p>
                    <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-sm">
                      {String(proposta.observacoesCoordenador)}
                    </p>
                  </div>
                )}
              </>
            }
          </CardContent>
        </Card>
      </div>

      {/* Indicador de Modo Read-only para Diretores */}
      {proposta && proposta.status !== "PENDENTE_APROVACAO" && (
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
                <Lock className="text-primary h-4 w-4" />
                <Eye className="h-4 w-4" />
              </>
            }
          </div>
          <AlertDescription className="ml-8">
            {proposta.status === "APROVADA" && (
              <span>
                <strong>Proposta Aprovada:</strong> Esta proposta já foi aprovada
                e está em modo de visualização apenas.
              </span>
            )}
            {proposta.status === "REJEITADA" && (
              <span>
                <strong>Proposta Rejeitada:</strong> Esta proposta foi rejeitada e
                está em modo de visualização.
              </span>
            )}
            {proposta.status === "DRAFT" && (
              <span>
                <strong>Proposta em Elaboração:</strong> Esta proposta ainda está
                sendo editada pelo coordenador.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Grade de Horários da Proposta - Sempre Read-only para Diretores */}
      {proposta && (
        <PropostaScheduleGrid
          propostaId={proposta.id}
          readonly={true}
        />
      )}
    </div>
  )
}
