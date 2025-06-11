import React from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumoHorariosCardsProps {
  disponiveisCount: number
  indisponiveisCount: number
  totalCount: number
}

interface CardData {
  icon: LucideIcon
  label: string
  value: number
  description: string
  variant: "success" | "destructive" | "info" | "warning"
  suffix?: string
}

interface SummaryCardProps {
  data: CardData
}

const cardVariants = {
  success: {
    cardClasses: "",
    iconClasses: "text-teal-600 dark:text-teal-400",
    valueClasses: "text-teal-700 dark:text-teal-300",
    bgClasses: "bg-teal-100/80 dark:bg-teal-900/30",
    ringClasses: "ring-teal-200/50 dark:ring-teal-700/30",
    progressClasses: "bg-teal-500/80 dark:bg-teal-500/60",
  },
  destructive: {
    cardClasses: "",
    iconClasses: "text-rose-600 dark:text-rose-400",
    valueClasses: "text-rose-700 dark:text-rose-300",
    bgClasses: "bg-rose-100/80 dark:bg-rose-900/30",
    ringClasses: "ring-rose-200/50 dark:ring-rose-700/30",
    progressClasses: "bg-rose-500/80 dark:bg-rose-500/60",
  },
  info: {
    cardClasses: "",
    iconClasses: "text-blue-600 dark:text-blue-400",
    valueClasses: "text-blue-700 dark:text-blue-300",
    bgClasses: "bg-blue-100/80 dark:bg-blue-900/30",
    ringClasses: "ring-blue-200/50 dark:ring-blue-700/30",
    progressClasses: "bg-blue-500/80 dark:bg-blue-500/60",
  },
  warning: {
    cardClasses: "",
    iconClasses: "text-amber-600 dark:text-amber-400",
    valueClasses: "text-amber-700 dark:text-amber-300",
    bgClasses: "bg-amber-100/80 dark:bg-amber-900/30",
    ringClasses: "ring-amber-200/50 dark:ring-amber-700/30",
    progressClasses: "bg-amber-500/80 dark:bg-amber-500/60",
  },
}

/**
 * Componente individual para cada card de resumo com design moderno e compacto
 */
const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  const { icon: Icon, label, value, description, variant, suffix } = data
  const styles = cardVariants[variant]

  return (
    <Card
      className={cn(
        styles.cardClasses,
        "group relative overflow-hidden rounded-lg border p-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
      )}
    >
      {/* Elemento decorativo de fundo */}
      <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 transform opacity-10">
        <Icon className="h-full w-full" />
      </div>

      <div className="relative p-4">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={cn(
              styles.bgClasses,
              styles.ringClasses,
              "flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ring-1 transition-shadow duration-300 group-hover:shadow-md",
            )}
          >
            <Icon className={cn("h-5 w-5", styles.iconClasses)} />
          </div>
          <div className="text-right">
            <p className="text-muted-foreground/80 mb-0.5 text-xs font-medium tracking-wider uppercase">
              {label}
            </p>
            <div
              className={cn(
                "font-mono text-2xl leading-none font-bold tabular-nums",
                styles.valueClasses,
              )}
            >
              {value.toLocaleString()}
              {suffix && <span className="text-lg">{suffix}</span>}
            </div>
          </div>
        </div>

        <div className="mt-1.5 border-t border-current/10 pt-2.5">
          <p className="text-muted-foreground/90 text-sm font-medium">
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}

/**
 * Exibe cards de resumo para horários disponíveis, indisponíveis e total.
 * Design moderno com gradientes, cores semânticas e melhor hierarquia visual.
 * Versão compacta e proporcional.
 */
export const ResumoHorariosCards: React.FC<ResumoHorariosCardsProps> = ({
  disponiveisCount,
  indisponiveisCount,
  totalCount,
}) => {
  const cardsData: CardData[] = [
    {
      icon: CheckCircle,
      label: "Disponíveis",
      value: disponiveisCount,
      description: "Horários para agendamento",
      variant: "success",
    },
    {
      icon: XCircle,
      label: "Indisponíveis",
      value: indisponiveisCount,
      description: "Horários bloqueados",
      variant: "destructive",
    },
    {
      icon: BarChart3,
      label: "Total",
      value: totalCount,
      description: "Horários cadastrados",
      variant: "info",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cardsData.map((cardData) => (
        <SummaryCard
          key={cardData.label}
          data={cardData}
        />
      ))}
    </div>
  )
}
