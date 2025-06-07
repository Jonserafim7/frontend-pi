import { Button } from "@/components/ui/button"
import { AlertCircle, Plus } from "lucide-react"
import { ScheduleGrid } from "./schedule-grid"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { usePropostaDraftAtiva } from "../hooks/use-proposta-draft-ativa"
import { useCoordenadorCursos } from "../hooks/use-coordenador-cursos"
import { usePeriodoAtivoId } from "../hooks/use-periodo-ativo"
import { useCreateProposta } from "../hooks/use-create-proposta"
import { useActions } from "../hooks/use-actions"

import { toast } from "sonner"
import { useMemo, useCallback } from "react"

/**
 * Componente completamente independente para edição de propostas em estado draft
 * Faz suas próprias queries e gerencia seu próprio estado
 */
export function DraftEditor() {
  const { user, isCoordenador } = useAuth()

  // Buscar cursos do coordenador
  const {
    cursoPrincipalId,
    hasCursos,
    isLoading: isLoadingCursos,
    cursoPrincipal,
  } = useCoordenadorCursos({
    enabled: isCoordenador() && !!user,
  })

  // Buscar período letivo ativo
  const periodoAtivoId = usePeriodoAtivoId(!!user)

  // Buscar proposta draft ativa
  const {
    data: propostaDraftAtiva,
    hasDraftAtiva,
    refetch: refetchDraft,
  } = usePropostaDraftAtiva({
    cursoId: cursoPrincipalId,
    periodoId: periodoAtivoId,
    enabled: isCoordenador() && !!cursoPrincipalId && !!periodoAtivoId,
  })

  // As alocações já vêm na proposta draft, não precisamos fazer query separada
  const alocacoesPropostaDraft = useMemo(() => {
    if (!propostaDraftAtiva) {
      console.log("⚠️ [DraftEditor] Sem proposta draft ativa")
      return []
    }

    const alocacoes = propostaDraftAtiva.alocacoesPropostas || []

    console.log("🔍 [DraftEditor] Alocações da proposta draft:", {
      propostaId: propostaDraftAtiva.id,
      totalAlocacoes: alocacoes.length,
      alocacoes: alocacoes,
    })

    return alocacoes
  }, [propostaDraftAtiva])

  // Verificar se pode enviar proposta
  const podeEnviarProposta = useMemo(() => {
    const pode = alocacoesPropostaDraft.length > 0
    console.log("🎯 [DraftEditor] Pode enviar proposta:", {
      quantidadeAlocacoes: alocacoesPropostaDraft.length,
      podeEnviar: pode,
    })
    return pode
  }, [alocacoesPropostaDraft.length])

  // Hooks para ações
  const { createProposta, isCreating } = useCreateProposta()
  const { submitProposta, isSubmitting } = useActions()

  // Handlers
  const handleCreateNova = useCallback(async () => {
    if (!user) {
      toast.error("Erro: Usuário não encontrado")
      return
    }

    if (!cursoPrincipalId) {
      toast.error("Não foi possível encontrar o curso associado ao seu perfil.")
      return
    }

    if (isLoadingCursos) {
      toast.error("Aguarde o carregamento dos dados do curso...")
      return
    }

    if (!periodoAtivoId) {
      toast.error("Não foi possível encontrar o período letivo ativo.")
      return
    }

    try {
      await createProposta({
        idCurso: cursoPrincipalId,
        idPeriodoLetivo: periodoAtivoId,
        observacoesCoordenador: "Nova proposta criada",
      })
      refetchDraft()
    } catch (error) {
      console.error(error)
    }
  }, [
    user,
    cursoPrincipalId,
    isLoadingCursos,
    periodoAtivoId,
    createProposta,
    refetchDraft,
  ])

  const handleEnviarProposta = useCallback(async () => {
    if (!propostaDraftAtiva) return

    try {
      await submitProposta(propostaDraftAtiva.id)
      refetchDraft()
    } catch (error) {
      console.error(error)
    }
  }, [propostaDraftAtiva, submitProposta, refetchDraft])

  // Componente de aviso quando coordenador não tem curso
  const NoCourseWarning = () => (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-orange-800">
            Nenhum curso associado
          </h3>
          <p className="mt-1 text-sm text-orange-700">
            Entre em contato com o administrador para vincular um curso ao seu
            perfil.
          </p>
        </div>
      </div>
    </div>
  )

  // Componente de feedback sobre alocações
  const AlocacoesFeedback = () => {
    if (podeEnviarProposta) return null

    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Proposta sem alocações
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Adicione pelo menos uma alocação de horário antes de enviar a
              proposta para aprovação.
            </p>
            <p className="mt-1 text-xs text-amber-600">
              Total de alocações: {alocacoesPropostaDraft.length}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Empty state quando não há draft ativa
  const EmptyDraftState = () => (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Plus className="h-6 w-6 text-gray-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {isCoordenador() ?
          "Nenhuma proposta em rascunho"
        : "Nenhuma proposta em rascunho"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-600">
        {isCoordenador() ?
          "Crie uma nova proposta de horário para começar a organizar as aulas do seu curso."
        : "Os coordenadores não criaram propostas ainda."}
      </p>
      {isCoordenador() && hasCursos && (
        <Button
          className="mt-6"
          onClick={handleCreateNova}
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Proposta
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
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
            data-testid="btn-nova-proposta"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Proposta
          </Button>
        </div>
      )}

      {/* Aviso quando o coordenador não tem curso associado */}
      {isCoordenador() && !isLoadingCursos && !hasCursos && <NoCourseWarning />}

      {/* Grade de horários para edição ou empty state */}
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

            <div className="mt-4 space-y-4">
              {/* Feedback visual sobre alocações */}
              <AlocacoesFeedback />

              <div className="flex justify-end">
                <Button
                  onClick={handleEnviarProposta}
                  disabled={isSubmitting || !podeEnviarProposta}
                  variant={podeEnviarProposta ? "default" : "secondary"}
                  data-testid="btn-enviar-proposta"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {podeEnviarProposta ?
                    "Enviar para Aprovação"
                  : `Sem alocações (${alocacoesPropostaDraft.length})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      : <EmptyDraftState />}
    </div>
  )
}
