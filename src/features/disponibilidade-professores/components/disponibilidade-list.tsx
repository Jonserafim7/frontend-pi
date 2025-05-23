import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DisponibilidadeCard } from "./disponibilidade-card"
import type {
  DiaSemana,
  StatusDisponibilidade,
} from "../schemas/disponibilidade-schemas"
import { DIAS_SEMANA_ORDER } from "../schemas/disponibilidade-schemas"

/**
 * Interface representando uma disponibilidade para a lista
 */
interface DisponibilidadeListItem {
  id: string
  diaDaSemana: DiaSemana
  horaInicio: string
  horaFim: string
  status: StatusDisponibilidade
  professor?: {
    id: string
    nome: string
  }
  periodoLetivo?: {
    id: string
    nome: string
  }
  dataCriacao: Date
  dataAtualizacao: Date
}

/**
 * Propriedades do componente DisponibilidadeList
 */
interface DisponibilidadeListProps {
  /** Lista de disponibilidades */
  disponibilidades: DisponibilidadeListItem[]
  /** Callback para editar disponibilidade */
  onEdit?: (disponibilidade: DisponibilidadeListItem) => void
  /** Callback para excluir disponibilidade */
  onDelete?: (id: string) => void
  /** Callback para criar nova disponibilidade */
  onCreate?: () => void
  /** Se está carregando */
  isLoading?: boolean
  /** Estado de loading para operações específicas */
  loadingStates?: Record<string, boolean>
  /** Se deve mostrar informações do professor */
  showProfessor?: boolean
  /** Se deve mostrar informações do período */
  showPeriodo?: boolean
  /** Título da lista */
  title?: string
  /** Descrição da lista */
  description?: string
  /** Se deve mostrar botão de criar */
  showCreateButton?: boolean
  /** Modo de visualização */
  viewMode?: "cards" | "grid"
}

/**
 * Componente para exibir lista de disponibilidades
 */
export function DisponibilidadeList({
  disponibilidades,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
  loadingStates = {},
  showProfessor = false,
  showPeriodo = false,
  title = "Disponibilidades",
  description,
  showCreateButton = true,
  viewMode = "cards",
}: DisponibilidadeListProps) {
  // Ordenar disponibilidades por dia da semana e depois por horário de início
  const sortedDisponibilidades = [...disponibilidades].sort((a, b) => {
    const diaA = DIAS_SEMANA_ORDER[a.diaDaSemana]
    const diaB = DIAS_SEMANA_ORDER[b.diaDaSemana]

    if (diaA !== diaB) {
      return diaA - diaB
    }

    // Se mesmo dia, ordenar por horário de início
    return a.horaInicio.localeCompare(b.horaInicio)
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted h-32 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!sortedDisponibilidades.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {showCreateButton && onCreate && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Disponibilidade
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">
              Nenhuma disponibilidade encontrada
            </h3>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
              {showCreateButton ?
                "Você ainda não informou suas disponibilidades de horário. Clique no botão abaixo para começar."
              : "Não há disponibilidades para exibir com os filtros selecionados."
              }
            </p>
            {showCreateButton && onCreate && (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Disponibilidade
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const gridClasses =
    viewMode === "grid" ?
      "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {showCreateButton && onCreate && (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Disponibilidade
          </Button>
        )}
      </div>

      <div className={gridClasses}>
        {sortedDisponibilidades.map((disponibilidade) => {
          const itemLoading = loadingStates[disponibilidade.id] || false

          return (
            <DisponibilidadeCard
              key={disponibilidade.id}
              disponibilidade={disponibilidade}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={itemLoading}
              showProfessor={showProfessor}
              showPeriodo={showPeriodo}
            />
          )
        })}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-center pt-4">
        <p className="text-muted-foreground text-sm">
          {disponibilidades.length === 1 ?
            "1 disponibilidade encontrada"
          : `${disponibilidades.length} disponibilidades encontradas`}
        </p>
      </div>
    </div>
  )
}
