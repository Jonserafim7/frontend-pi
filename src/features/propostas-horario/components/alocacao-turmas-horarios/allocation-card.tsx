"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

interface AllocationCardProps {
  /**
   * Dados da alocação a ser exibida
   */
  alocacao: AlocacaoHorarioResponseDto
  /**
   * Callback para quando a alocação é removida
   */
  onRemove?: (alocacaoId: string) => void
  /**
   * Se está em estado de loading
   */
  isLoading?: boolean
  /**
   * Se deve exibir o botão de remoção (modo edição)
   */
  showRemoveButton?: boolean
  /**
   * Modo somente leitura - desabilita interações e remove botões
   */
  readonly?: boolean
  /**
   * Tamanho do card
   */
  size?: "compact" | "normal" | "large"
  /**
   * Se deve mostrar informação do professor quando há muitas alocações
   */
  hideTeacherWhenCrowded?: boolean
  /**
   * Número total de alocações no slot (para otimizações visuais)
   */
  totalAllocations?: number
  /**
   * Data test id para testes automatizados
   */
  "data-testid"?: string
}

/**
 * Componente de card para exibir uma alocação de turma.
 *
 * Características:
 * - Design compacto e responsivo
 * - Suporte a diferentes tamanhos
 * - Botão de remoção condicional
 * - Otimizações visuais baseadas na quantidade de alocações
 * - Tipografia responsiva
 * - Estados de hover e loading
 *
 * @component
 */
export function AllocationCard({
  alocacao,
  onRemove,
  isLoading = false,
  showRemoveButton = true,
  readonly = false,
  size = "normal",
  hideTeacherWhenCrowded = false,
  totalAllocations = 1,
  "data-testid": dataTestId,
}: AllocationCardProps) {
  // Classes de estilo baseadas no tamanho
  const getSizeClasses = () => {
    switch (size) {
      case "compact":
        return {
          container: "p-1",
          spacing: "space-y-0.5",
          badge: "text-[9px]",
          title: "text-[9px]",
          subtitle: "text-[8px]",
          removeButton: "h-3 w-3",
          removeIcon: "h-1.5 w-1.5",
        }
      case "large":
        return {
          container: "p-3 sm:p-4",
          spacing: "space-y-2 sm:space-y-3",
          badge: "text-sm sm:text-base",
          title: "text-sm sm:text-base",
          subtitle: "text-sm",
          removeButton: "h-7 w-7 sm:h-8 sm:w-8",
          removeIcon: "h-4 w-4 sm:h-5 sm:w-5",
        }
      default: // normal
        return {
          container: "p-1 sm:p-1.5 lg:p-2",
          spacing: "space-y-0.5 sm:space-y-1",
          badge: "text-[10px] sm:text-xs lg:text-sm",
          title: "text-[10px] sm:text-xs lg:text-sm",
          subtitle: "text-[9px] sm:text-xs lg:text-sm",
          removeButton: "h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6",
          removeIcon: "h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4",
        }
    }
  }

  const sizeClasses = getSizeClasses()

  // Determinar se deve ocultar professor (quando há muitas alocações e está habilitado)
  const shouldHideTeacher = hideTeacherWhenCrowded && totalAllocations > 3

  // Classes de hover baseadas no modo
  const getHoverClasses = () => {
    if (readonly || isLoading) {
      return "bg-muted/5 cursor-default"
    }
    return "bg-sidebar-accent hover:bg-primary/50 hover:shadow-md hover:scale-[1.02] cursor-pointe"
  }

  // Determinar se deve mostrar botão de remoção
  const shouldShowRemoveButton = showRemoveButton && !readonly && onRemove

  return (
    <div
      className={`group relative rounded-lg border transition-all duration-200 ${getHoverClasses()} ${sizeClasses.container} ${isLoading ? "opacity-50" : ""}`}
      data-testid={dataTestId}
      onClick={
        readonly ? undefined : (
          () => {
            // Clique no card pode ser usado para ações futuras se necessário
          }
        )
      }
    >
      {/* Botão X para remover (só aparece no hover se habilitado) */}
      {shouldShowRemoveButton && (
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(alocacao.id)
          }}
          disabled={isLoading}
          className={`absolute -top-1 -right-1 ${sizeClasses.removeButton} hover:border-destructive-foreground/50 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:scale-110 hover:border`}
          aria-label="Remover alocação"
          data-testid={
            dataTestId ? `${dataTestId}-remove-btn` : "remove-allocation-btn"
          }
        >
          <X className={sizeClasses.removeIcon} />
        </Button>
      )}

      {/* Conteúdo do card */}
      <div className={sizeClasses.spacing}>
        {/* Código da turma */}
        <Badge
          variant={readonly ? "outline" : "secondary"}
          className={`font-mono font-semibold ${sizeClasses.badge}`}
        >
          {alocacao.turma.codigoDaTurma}
          {readonly && <span className="ml-1 text-[8px] opacity-60">📖</span>}
        </Badge>

        {/* Nome da disciplina */}
        <div
          className={`text-foreground line-clamp-2 leading-tight font-medium ${sizeClasses.title}`}
        >
          {alocacao.turma.disciplinaOfertada?.disciplina?.nome ||
            "Disciplina não informada"}
        </div>

        {/* Professor - condicional baseado no crowding */}
        {!shouldHideTeacher && (
          <div className={`line-clamp-1 leading-tight ${sizeClasses.subtitle}`}>
            {alocacao.turma.professorAlocado?.nome || "Professor não definido"}
          </div>
        )}
      </div>
    </div>
  )
}
