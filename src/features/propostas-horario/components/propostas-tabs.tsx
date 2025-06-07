import { Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePropostas } from "../hooks/use-propostas"
import { PropostaHorarioResponseDtoStatus } from "@/api-generated/model"
import { useMemo } from "react"

interface PropostasTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
}

/**
 * Componente independente para navegação entre abas de propostas
 * Calcula contadores automaticamente baseado nas propostas existentes
 */
export function PropostasTabs({ activeTab, onTabChange }: PropostasTabsProps) {
  // Buscar propostas (React Query faz cache automático)
  const { propostas, isLoading } = usePropostas({
    enabled: true,
  })

  // Calcular contadores por status
  const contadores = useMemo(() => {
    if (isLoading) {
      return { draft: 0, pendente: 0, aprovada: 0, rejeitada: 0 }
    }

    return {
      draft: propostas.filter(
        (p) => p.status === PropostaHorarioResponseDtoStatus.DRAFT,
      ).length,
      pendente: propostas.filter(
        (p) => p.status === PropostaHorarioResponseDtoStatus.PENDENTE_APROVACAO,
      ).length,
      aprovada: propostas.filter(
        (p) => p.status === PropostaHorarioResponseDtoStatus.APROVADA,
      ).length,
      rejeitada: propostas.filter(
        (p) => p.status === PropostaHorarioResponseDtoStatus.REJEITADA,
      ).length,
    }
  }, [propostas, isLoading])

  // Configuração das abas
  const tabsConfig = [
    {
      value: "draft",
      label: "Rascunhos",
      shortLabel: "Draft",
      icon: FileText,
      count: contadores.draft,
      color: "text-gray-600",
    },
    {
      value: "pendente",
      label: "Pendentes",
      shortLabel: "Pend.",
      icon: Clock,
      count: contadores.pendente,
      color: "text-yellow-600",
    },
    {
      value: "aprovada",
      label: "Aprovadas",
      shortLabel: "Aprov.",
      icon: CheckCircle,
      count: contadores.aprovada,
      color: "text-green-600",
    },
    {
      value: "rejeitada",
      label: "Rejeitadas",
      shortLabel: "Rejeit.",
      icon: XCircle,
      count: contadores.rejeitada,
      color: "text-red-600",
    },
  ]

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
    >
      <TabsList className="grid w-full grid-cols-4">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 text-sm"
            >
              <Icon
                className={`h-4 w-4 ${isActive ? tab.color : "text-muted-foreground"}`}
              />

              {/* Texto completo em desktop */}
              <span className="hidden sm:inline">{tab.label}</span>

              {/* Texto abreviado em mobile */}
              <span className="sm:hidden">{tab.shortLabel}</span>

              {/* Contador */}
              {tab.count > 0 && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive ?
                      "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

/**
 * Hook para verificar se há propostas com problemas (alertas)
 */
export function usePropostasAlerts() {
  const { propostas, isLoading } = usePropostas({
    enabled: true,
  })

  return useMemo(() => {
    if (isLoading) return { hasAlerts: false, alertCount: 0 }

    const rejeitadas = propostas.filter(
      (p) => p.status === PropostaHorarioResponseDtoStatus.REJEITADA,
    )

    return {
      hasAlerts: rejeitadas.length > 0,
      alertCount: rejeitadas.length,
    }
  }, [propostas, isLoading])
}
