import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, CheckCircle, Plus, XCircle } from "lucide-react"

interface EmptyStateConfig {
  title: string
  description: string
  showAction?: boolean
  actionLabel?: string
  actionHandler?: () => Promise<void>
  icon?: React.ComponentType<{ className?: string }>
}

interface EmptyStateProps {
  type: "draft" | "pendente" | "aprovada" | "rejeitada"
  isCoordenador: boolean
  isActionLoading?: boolean
  onCreateNova?: () => Promise<void>
}

/**
 * Componente reutilizável para exibir estados vazios com configurações específicas por tipo
 */
export function EmptyState({
  type,
  isCoordenador,
  isActionLoading = false,
  onCreateNova,
}: EmptyStateProps) {
  const getEmptyStateConfig = (): EmptyStateConfig => {
    switch (type) {
      case "draft":
        return {
          title:
            isCoordenador ?
              "Nenhuma proposta em rascunho"
            : "Nenhuma proposta em rascunho",
          description:
            isCoordenador ?
              "Crie uma nova proposta de horário para começar a organizar as aulas do seu curso."
            : "Os coordenadores não criaram propostas ainda.",
          showAction: isCoordenador,
          actionLabel: "Nova Proposta",
          actionHandler: onCreateNova,
          icon: Plus,
        }
      case "pendente":
        return {
          title: "Nenhuma proposta pendente",
          description:
            isCoordenador ?
              "Não há propostas aguardando aprovação no momento."
            : "Não há propostas aguardando sua aprovação no momento.",
          showAction: false,
          icon: AlertCircle,
        }
      case "aprovada":
        return {
          title: "Nenhuma proposta aprovada",
          description:
            isCoordenador ?
              "Suas propostas aprovadas aparecerão aqui."
            : "Propostas aprovadas por você aparecerão aqui.",
          showAction: false,
          icon: CheckCircle,
        }
      case "rejeitada":
        return {
          title: "Nenhuma proposta rejeitada",
          description:
            isCoordenador ?
              "Suas propostas rejeitadas aparecerão aqui."
            : "Propostas rejeitadas por você aparecerão aqui.",
          showAction: false,
          icon: XCircle,
        }
      default:
        return {
          title: "Nenhuma proposta encontrada",
          description: "Não há propostas para exibir no momento.",
          showAction: false,
          icon: Calendar,
        }
    }
  }

  const config = getEmptyStateConfig()
  const IconComponent = config.icon || Calendar

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <IconComponent className="h-6 w-6 text-gray-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{config.title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-600">{config.description}</p>
      {config.showAction && config.actionHandler && (
        <Button
          className="mt-6"
          onClick={config.actionHandler}
          disabled={isActionLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          {config.actionLabel}
        </Button>
      )}
    </div>
  )
}

/**
 * Componente específico para empty state de aviso quando coordenador não tem curso
 */
export function NoCourseWarning() {
  return (
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
}

/**
 * Componente específico para feedback visual quando proposta não pode ser enviada
 */
interface PropostaFeedbackProps {
  alocacoesCount: number
  canSend: boolean
}

export function PropostaFeedback({
  alocacoesCount,
  canSend,
}: PropostaFeedbackProps) {
  if (canSend) return null

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Proposta sem alocações
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Adicione pelo menos uma alocação de horário antes de enviar a proposta
            para aprovação.
          </p>
          <p className="mt-1 text-xs text-amber-600">
            Total de alocações: {alocacoesCount}
          </p>
        </div>
      </div>
    </div>
  )
}
