import { useState, useCallback } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CalendarDays, RefreshCw } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { usePropostas } from "../hooks/use-propostas"
import { useActions } from "../hooks/use-actions"

import type { PropostaHorarioResponseDto } from "@/api-generated/model"
import { ApproveModal } from "../components/modals/approve-modal"
import { RejectModal } from "../components/modals/reject-modal"
import { PropostasTabs } from "../components/propostas-tabs"
import { DraftEditor } from "../components/draft-editor"
import { PropostasList } from "../components/propostas-list"
import { CourseFilter } from "../components/course-filter"

/**
 * Página simplificada com componentes independentes.
 * Cada componente faz suas próprias queries (React Query cache automático).
 */
export function PropostasHorarioPage() {
  const { user } = useAuth()

  // Estados mínimos da página
  const [activeTab, setActiveTab] = useState("draft")
  const [filterCourse, setFilterCourse] = useState<string>("")

  // Estados dos modais
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedProposta, setSelectedProposta] =
    useState<PropostaHorarioResponseDto | null>(null)

  // Hooks mínimos
  const { canViewAll, refetch } = usePropostas({ enabled: !!user })
  const { approveProposta, rejectProposta } = useActions()

  // Handlers básicos
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  const handleFilterChange = useCallback((value: string) => {
    setFilterCourse(value)
  }, [])

  // Handlers dos modais (simplificados)
  const handleOpenApproveModal = useCallback(
    (proposta: PropostaHorarioResponseDto) => {
      setSelectedProposta(proposta)
      setApproveModalOpen(true)
    },
    [],
  )

  const handleOpenRejectModal = useCallback(
    (proposta: PropostaHorarioResponseDto) => {
      setSelectedProposta(proposta)
      setRejectModalOpen(true)
    },
    [],
  )

  const handleApprove = useCallback(
    async (observacoes: string) => {
      if (!selectedProposta) return

      await approveProposta({
        id: selectedProposta.id,
        observacoesDiretor: observacoes || undefined,
      })
      refetch()
    },
    [selectedProposta, approveProposta, refetch],
  )

  const handleReject = useCallback(
    async (justificativa: string, observacoes: string) => {
      if (!selectedProposta) return

      await rejectProposta({
        id: selectedProposta.id,
        justificativaRejeicao: justificativa,
        observacoesDiretor: observacoes || undefined,
      })
      refetch()
    },
    [selectedProposta, rejectProposta, refetch],
  )

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
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sistema de abas independente */}
      <div className="space-y-6">
        <PropostasTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Filtro para Diretores (independente) */}
        {canViewAll && activeTab !== "draft" && (
          <CourseFilter
            selectedCourse={filterCourse}
            onCourseChange={handleFilterChange}
          />
        )}

        {/* Conteúdo das abas - componentes independentes */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
        >
          {/* Aba de Rascunhos - componente completamente independente */}
          <TabsContent
            value="draft"
            className="space-y-6"
          >
            <DraftEditor />
          </TabsContent>

          {/* Aba de Propostas Pendentes - componente independente */}
          <TabsContent
            value="pendente"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Propostas Pendentes</h2>
                <p className="text-muted-foreground text-sm">
                  Propostas aguardando aprovação da diretoria
                </p>
              </div>
            </div>

            <PropostasList
              tabType="pendente"
              courseFilter={filterCourse}
              onAprovar={handleOpenApproveModal}
              onRejeitar={handleOpenRejectModal}
            />
          </TabsContent>

          {/* Aba de Propostas Aprovadas - componente independente */}
          <TabsContent
            value="aprovada"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Propostas Aprovadas</h2>
                <p className="text-muted-foreground text-sm">
                  Propostas aprovadas pela diretoria
                </p>
              </div>
            </div>

            <PropostasList
              tabType="aprovada"
              courseFilter={filterCourse}
            />
          </TabsContent>

          {/* Aba de Propostas Rejeitadas - componente independente */}
          <TabsContent
            value="rejeitada"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Propostas Rejeitadas</h2>
                <p className="text-muted-foreground text-sm">
                  Propostas rejeitadas pela diretoria com justificativa
                </p>
              </div>
            </div>

            <PropostasList
              tabType="rejeitada"
              courseFilter={filterCourse}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais de aprovação e rejeição */}
      <ApproveModal
        open={approveModalOpen}
        onOpenChange={setApproveModalOpen}
        proposta={selectedProposta}
        onConfirm={handleApprove}
      />

      <RejectModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        proposta={selectedProposta}
        onConfirm={handleReject}
      />
    </div>
  )
}
