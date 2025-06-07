import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { ScheduleGrid } from "../components/schedule-grid"
import { PropostasList } from "../components/propostas-list"
import { usePropostaDraftAtiva } from "../hooks/use-proposta-draft-ativa"
import { useMinhasPropostas } from "../hooks/use-minhas-propostas"
import { useProposalOperations } from "../hooks/use-proposal-operations"
import { useCoordenadorCursos } from "../hooks/use-coordenador-cursos"
import { usePeriodoAtivoId } from "../hooks/use-periodo-ativo"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

/**
 * Página principal para montagem e gerenciamento de propostas de horário.
 *
 * Características:
 * - Sistema de abas por status (DRAFT, PENDENTE, APROVADA, REJEITADA)
 * - Ações contextuais baseadas no papel do usuário
 * - Integração com ScheduleGrid para edição de propostas DRAFT
 * - Lista de propostas para outros status
 * - Dialogs para ações de aprovação/rejeição
 */
export function PropostasHorarioPage() {
  const { user, isCoordenador, isDiretor, isAdmin } = useAuth()

  // Estados locais
  const [activeTab, setActiveTab] = useState("draft")
  const [selectedProposta, setSelectedProposta] =
    useState<PropostaHorarioResponseDto | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
  const [observacoesDiretor, setObservacoesDiretor] = useState("")
  const [justificativaRejeicao, setJustificativaRejeicao] = useState("")

  // Determinação de permissões baseada no papel
  const showCoordenadorActions = isCoordenador()
  const showDiretorActions = isDiretor() || isAdmin()

  // Hook para buscar propostas usando nosso hook personalizado
  const {
    isLoading,
    canViewAll,
    refetch,
    propostasDraft,
    propostasPendentes,
    propostasAprovadas,
    propostasRejeitadas,
    contadores,
  } = useMinhasPropostas({
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Hook para buscar cursos do coordenador
  const {
    cursoPrincipalId,
    hasCursos,
    isLoading: isLoadingCursos,
    cursoPrincipal,
  } = useCoordenadorCursos({
    enabled: isCoordenador() && !!user,
  })

  // Hook para buscar período letivo ativo
  const periodoAtivoId = usePeriodoAtivoId(!!user)

  // Hook para proposta draft ativa (coordenadores)
  const {
    data: propostaDraftAtiva,
    hasDraftAtiva,
    refetch: refetchDraft,
  } = usePropostaDraftAtiva({
    cursoId: cursoPrincipalId, // Usando o curso principal do coordenador
    periodoId: periodoAtivoId, // Período letivo ativo real
    enabled: isCoordenador() && !!cursoPrincipalId && !!periodoAtivoId, // Habilitado quando temos curso e período
  })

  // Hook para operações (criar, enviar, aprovar, rejeitar)
  const {
    createProposta,
    submitProposta,
    approveProposta,
    rejectProposta,
    isCreating,
    isSubmitting,
    isApproving,
    isRejecting,
  } = useProposalOperations({
    showToasts: true,
    autoInvalidate: true,
    onSuccess: {
      create: () => {
        setActiveTab("draft")
        refetch()
      },
      submit: () => {
        refetch()
      },
      approve: () => {
        refetch()
      },
      reject: () => {
        refetch()
      },
    },
  })

  /**
   * Propostas agrupadas por status - usando dados do hook
   */
  const propostasByStatus = {
    [PropostaHorarioResponseDtoStatus.DRAFT]: propostasDraft,
    [PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO]: propostasPendentes,
    [PropostaHorarioResponseDtoStatus.APROVADA]: propostasAprovadas,
    [PropostaHorarioResponseDtoStatus.REJEITADA]: propostasRejeitadas,
  }

  /**
   * Configuração das abas com ícones e contadores - usando dados do hook
   */
  const tabsConfig = [
    {
      value: "draft",
      label: "Rascunhos",
      icon: FileText,
      count: contadores.draft,
      color: "text-yellow-600",
    },
    {
      value: "pendente",
      label: "Pendentes",
      icon: Clock,
      count: contadores.pendentes,
      color: "text-blue-600",
    },
    {
      value: "aprovada",
      label: "Aprovadas",
      icon: CheckCircle,
      count: contadores.aprovadas,
      color: "text-green-600",
    },
    {
      value: "rejeitada",
      label: "Rejeitadas",
      icon: XCircle,
      count: contadores.rejeitadas,
      color: "text-red-600",
    },
  ]

  /**
   * Handlers para ações - usando novos hooks
   */
  const handleRefresh = useCallback(() => {
    refetch()
    refetchDraft()
  }, [refetch, refetchDraft])

  const handleCreateNova = useCallback(async () => {
    if (!user) {
      toast.error("Erro: Usuário não encontrado")
      return
    }

    if (!cursoPrincipalId) {
      toast.error(
        "Não foi possível encontrar o curso associado ao seu perfil. Entre em contato com o administrador.",
      )
      return
    }

    if (isLoadingCursos) {
      toast.error("Aguarde o carregamento dos dados do curso...")
      return
    }

    if (!periodoAtivoId) {
      toast.error(
        "Não foi possível encontrar o período letivo ativo. Entre em contato com o administrador.",
      )
      return
    }

    try {
      await createProposta({
        idCurso: cursoPrincipalId,
        idPeriodoLetivo: periodoAtivoId, // Período letivo ativo real
        observacoesCoordenador: "Nova proposta criada",
      })
      // Success é tratado pelo hook com toast e navigation
    } catch (error) {
      // Error é tratado pelo hook com toast
      console.error(error)
    }
  }, [user, cursoPrincipalId, isLoadingCursos, createProposta])

  const handleEnviar = useCallback(
    async (proposta: PropostaHorarioResponseDto) => {
      try {
        await submitProposta(proposta.id)
        // Success é tratado pelo hook com toast e refetch
      } catch (error) {
        // Error é tratado pelo hook com toast
        console.error(error)
      }
    },
    [submitProposta],
  )

  const handleAprovar = useCallback((proposta: PropostaHorarioResponseDto) => {
    setSelectedProposta(proposta)
    setObservacoesDiretor("")
    setIsApprovalDialogOpen(true)
  }, [])

  const handleConfirmAprovar = useCallback(async () => {
    if (!selectedProposta) return

    try {
      await approveProposta({
        id: selectedProposta.id,
        observacoesDiretor: observacoesDiretor || undefined,
      })

      // Success é tratado pelo hook com toast e refetch
      setIsApprovalDialogOpen(false)
      setSelectedProposta(null)
    } catch (error) {
      // Error é tratado pelo hook com toast
      console.error(error)
    }
  }, [selectedProposta, observacoesDiretor, approveProposta])

  const handleRejeitar = useCallback((proposta: PropostaHorarioResponseDto) => {
    setSelectedProposta(proposta)
    setJustificativaRejeicao("")
    setIsRejectionDialogOpen(true)
  }, [])

  const handleConfirmRejeitar = useCallback(async () => {
    if (!selectedProposta || !justificativaRejeicao.trim()) {
      toast.error("Justificativa é obrigatória")
      return
    }

    try {
      await rejectProposta({
        id: selectedProposta.id,
        justificativaRejeicao,
      })

      // Success é tratado pelo hook com toast e refetch
      setIsRejectionDialogOpen(false)
      setSelectedProposta(null)
    } catch (error) {
      // Error é tratado pelo hook com toast
      console.error(error)
    }
  }, [selectedProposta, justificativaRejeicao, rejectProposta])

  const handleView = useCallback((proposta: PropostaHorarioResponseDto) => {
    // TODO: Implementar navegação para página de visualização detalhada
    console.log("Visualizar proposta:", proposta)
  }, [])

  const handleEdit = useCallback((proposta: PropostaHorarioResponseDto) => {
    // TODO: Implementar navegação para edição da proposta
    console.log("Editar proposta:", proposta)
  }, [])

  const handleDelete = useCallback((proposta: PropostaHorarioResponseDto) => {
    // TODO: Implementar exclusão de proposta
    console.log("Excluir proposta:", proposta)
  }, [])

  return (
    <div className="container mx-auto flex flex-col gap-8 p-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">
              {canViewAll ? "Gerenciar Propostas" : "Minhas Propostas"}
            </h1>
            <p className="text-muted-foreground">
              {canViewAll ?
                "Visualize e gerencie todas as propostas de horário"
              : "Monte e gerencie suas propostas de horário"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Sistema de abas */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2"
              >
                <Icon className={`h-4 w-4 ${tab.color}`} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1"
                  >
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Aba de Rascunhos */}
        <TabsContent
          value="draft"
          className="space-y-6"
        >
          {/* Cabeçalho com ação de criar proposta */}
          {isCoordenador() && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Propostas em Rascunho</h2>
                <p className="text-muted-foreground text-sm">
                  Propostas que ainda estão sendo elaboradas
                  {cursoPrincipal && (
                    <span className="ml-2 font-medium text-blue-600">
                      • {cursoPrincipal.nome}
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={handleCreateNova}
                disabled={isCreating || isLoadingCursos || !hasCursos}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Proposta
              </Button>
            </div>
          )}

          {/* Aviso quando o coordenador não tem curso associado */}
          {isCoordenador() && !isLoadingCursos && !hasCursos && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Nenhum curso associado
                  </h3>
                  <p className="mt-1 text-sm text-orange-700">
                    Você não possui cursos associados ao seu perfil. Entre em
                    contato com o administrador para vincular um curso ao seu
                    perfil de coordenador.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isCoordenador() && hasDraftAtiva && propostaDraftAtiva ?
            <div className="space-y-4">
              <div className="bg-card rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-semibold">
                  Editando: {propostaDraftAtiva.curso.nome}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Período: {propostaDraftAtiva.periodoLetivo.ano}/
                  {propostaDraftAtiva.periodoLetivo.semestre}
                </p>

                <ScheduleGrid
                  className="w-full"
                  propostaId={propostaDraftAtiva.id}
                />

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => handleEnviar(propostaDraftAtiva)}
                    disabled={isSubmitting}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Enviar para Aprovação
                  </Button>
                </div>
              </div>
            </div>
          : <PropostasList
              propostas={
                propostasByStatus[PropostaHorarioResponseDtoStatus.DRAFT]
              }
              isLoading={isLoading}
              showCoordenadorActions={showCoordenadorActions}
              showDiretorActions={showDiretorActions}
              onView={handleView}
              onEdit={handleEdit}
              onEnviar={handleEnviar}
              onDelete={handleDelete}
              showStatusTabs={false}
            />
          }
        </TabsContent>

        {/* Aba de Pendentes */}
        <TabsContent value="pendente">
          <PropostasList
            propostas={
              propostasByStatus[
                PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO
              ]
            }
            isLoading={isLoading}
            showCoordenadorActions={showCoordenadorActions}
            showDiretorActions={showDiretorActions}
            onView={handleView}
            onAprovar={handleAprovar}
            onRejeitar={handleRejeitar}
            showStatusTabs={false}
            title="Propostas Pendentes"
            description="Propostas aguardando aprovação da direção"
          />
        </TabsContent>

        {/* Aba de Aprovadas */}
        <TabsContent value="aprovada">
          <PropostasList
            propostas={
              propostasByStatus[PropostaHorarioResponseDtoStatus.APROVADA]
            }
            isLoading={isLoading}
            showCoordenadorActions={showCoordenadorActions}
            showDiretorActions={showDiretorActions}
            onView={handleView}
            showStatusTabs={false}
            title="Propostas Aprovadas"
            description="Propostas que foram aprovadas pela direção"
          />
        </TabsContent>

        {/* Aba de Rejeitadas */}
        <TabsContent value="rejeitada">
          <PropostasList
            propostas={
              propostasByStatus[PropostaHorarioResponseDtoStatus.REJEITADA]
            }
            isLoading={isLoading}
            showCoordenadorActions={showCoordenadorActions}
            showDiretorActions={showDiretorActions}
            onView={handleView}
            showStatusTabs={false}
            title="Propostas Rejeitadas"
            description="Propostas que foram rejeitadas pela direção"
          />
        </TabsContent>
      </Tabs>

      {/* Dialog de Aprovação */}
      <Dialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Proposta</DialogTitle>
            <DialogDescription>
              Confirme a aprovação da proposta {selectedProposta?.curso.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Adicione observações sobre a aprovação..."
                value={observacoesDiretor}
                onChange={(e) => setObservacoesDiretor(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAprovar}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog
        open={isRejectionDialogOpen}
        onOpenChange={setIsRejectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Proposta</DialogTitle>
            <DialogDescription>
              Informe a justificativa para rejeição da proposta{" "}
              {selectedProposta?.curso.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa">
                Justificativa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="justificativa"
                placeholder="Explique os motivos da rejeição..."
                value={justificativaRejeicao}
                onChange={(e) => setJustificativaRejeicao(e.target.value)}
                className="mt-2"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejeitar}
              disabled={isRejecting || !justificativaRejeicao.trim()}
            >
              {isRejecting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
