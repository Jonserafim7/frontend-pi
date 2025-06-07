import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

interface ScheduleCellViewProps {
  /**
   * Alocações existentes para o slot
   */
  alocacoes?: AlocacaoHorarioResponseDto[]
  /**
   * Callback para quando o botão de adicionar é clicado
   */
  onAddClick: () => void
  /**
   * Callback para quando uma alocação específica deve ser removida
   */
  onRemoveAlocacao: (alocacaoId: string) => void
  /**
   * Se a célula está em estado de loading
   */
  isLoading?: boolean
}

/**
 * Card compacto para exibir uma turma alocada
 */
function TurmaCard({
  alocacao,
  onRemove,
  isLoading,
}: {
  alocacao: AlocacaoHorarioResponseDto
  onRemove: (id: string) => void
  isLoading: boolean
}) {
  return (
    <div className="group/card relative mb-1 last:mb-0">
      <div className="bg-primary/10 border-primary/20 hover:bg-primary/15 flex items-center gap-2 rounded-md border p-2 pr-7 transition-colors">
        <div className="min-w-0 flex-1">
          <Badge
            variant="secondary"
            className="mb-1 text-xs"
          >
            <span className="truncate">{alocacao.turma.codigoDaTurma}</span>
          </Badge>
          <div className="text-muted-foreground truncate text-xs">
            {alocacao.turma.professorAlocado?.nome || "Professor não definido"}
          </div>
        </div>

        {/* Botão de remover - aparece no hover */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(alocacao.id)
          }}
          disabled={isLoading}
          className="hover:bg-destructive/10 hover:text-destructive absolute top-1/2 right-1 h-5 w-5 -translate-y-1/2 p-0 opacity-0 transition-opacity group-hover/card:opacity-100"
          aria-label={`Remover ${alocacao.turma.codigoDaTurma}`}
          data-testid={`btn-remover-${alocacao.turma.codigoDaTurma}`}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Componente de apresentação puro para célula da grade de horários.
 *
 * Renderiza:
 * - Cards compactos para cada turma alocada
 * - Botão "+" no canto superior direito (só no hover)
 * - Células que se expandem conforme necessário
 *
 * @component
 */
export function ScheduleCellView({
  alocacoes = [],
  onAddClick,
  onRemoveAlocacao,
  isLoading = false,
}: ScheduleCellViewProps) {
  const hasAlocacoes = alocacoes.length > 0

  // Calcular altura mínima baseada no número de alocações
  const minHeight = hasAlocacoes ? Math.max(80, alocacoes.length * 50 + 30) : 80

  return (
    <div
      className="group relative border-r p-2 transition-all last:border-r-0"
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Botão de adicionar - canto superior direito, só no hover */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddClick}
        disabled={isLoading}
        className="hover:bg-primary/10 absolute top-1 right-1 z-10 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Adicionar alocação"
        data-testid="btn-adicionar-alocacao"
      >
        <Plus className="h-3 w-3" />
      </Button>

      {/* Container para as turmas alocadas */}
      <div className="flex h-full flex-col">
        {hasAlocacoes ?
          <div className="space-y-1 pt-2">
            {alocacoes.map((alocacao) => (
              <TurmaCard
                key={alocacao.id}
                alocacao={alocacao}
                onRemove={onRemoveAlocacao}
                isLoading={isLoading}
              />
            ))}
          </div>
        : /* Área vazia - clicável para adicionar */
          <div
            onClick={onAddClick}
            className={`border-muted-foreground/10 hover:border-muted-foreground/20 flex h-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed transition-colors ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            data-testid="area-adicionar-alocacao"
          >
            <div className="text-muted-foreground/50 text-center text-xs">
              Clique para adicionar
            </div>
          </div>
        }
      </div>
    </div>
  )
}
