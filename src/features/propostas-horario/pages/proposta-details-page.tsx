import { HeaderIconContainer } from "@/components/icon-container"
import {
  CalendarDays,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useParams, useNavigate } from "react-router"
import { usePropostaHorario } from "../hooks/use-propostas-horario"
import { PropostaStatusBadge } from "../components/proposta-status-badge"

/**
 * Página de detalhes/edição de uma proposta de horário
 * Permite visualizar e editar propostas baseado no status
 */
export function PropostaDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: proposta, isLoading, error } = usePropostaHorario(id!)

  const handleBack = () => {
    navigate("/coordenador/propostas-horario")
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Erro</h1>
            <p className="text-muted-foreground">
              Não foi possível carregar a proposta
            </p>
          </div>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              {isLoading ? "Carregando..." : "Detalhes da Proposta"}
            </h1>
            {proposta && (
              <p className="text-muted-foreground">
                {proposta.curso.nome} - {proposta.periodoLetivo.ano}/
                {proposta.periodoLetivo.semestre}º Semestre
              </p>
            )}
          </div>
        </div>
      </div>

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

      {/* TODO: Implementar ScheduleGrid adaptado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="text-primary h-5 w-5" />
            Grade de Horários
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-8">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>Grade de horários será implementada aqui</p>
        </CardContent>
      </Card>
    </div>
  )
}
