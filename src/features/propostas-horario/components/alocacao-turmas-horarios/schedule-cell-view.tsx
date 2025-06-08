"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Book, Plus } from "lucide-react"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

interface ScheduleCellViewProps {
  /**
   * Alocação existente para o slot, se houver
   */
  alocacao?: AlocacaoHorarioResponseDto
  /**
   * Callback para quando a célula é clicada
   */
  onCellClick: () => void
  /**
   * Se a célula está em estado de loading
   */
  isLoading?: boolean
}

/**
 * Componente de apresentação puro para célula da grade de horários.
 *
 * Renderiza:
 * - Badge com código da turma e professor se houver alocação
 * - Botão para adicionar se não houver alocação
 * - Estados de loading
 *
 * @component
 */
export function ScheduleCellView({
  alocacao,
  onCellClick,
  isLoading = false,
}: ScheduleCellViewProps) {
  /**
   * Caso exista uma alocação: mostra badge com informações da turma
   */
  if (alocacao) {
    return (
      <div className="group relative min-h-[60px] border-r p-2 last:border-r-0">
        <div
          onClick={onCellClick}
          className={`bg-primary/10 hover:bg-primary/20 border-primary/20 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-colors ${isLoading ? "opacity-50" : ""} `}
        >
          {/* Ícone de livro indica célula ocupada */}
          <Book className="text-primary mb-1 h-4 w-4" />
          <div className="w-full text-center">
            <Badge
              variant="secondary"
              className="mb-1 max-w-full text-xs"
            >
              <span className="truncate">{alocacao.turma.codigoDaTurma}</span>
            </Badge>
            <div className="text-muted-foreground truncate text-xs">
              {alocacao.turma.professorAlocado?.nome || "Professor não definido"}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Caso não exista alocação: mostra botão para adicionar
   */
  return (
    <div className="group relative min-h-[60px] border-r p-2 last:border-r-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCellClick}
        disabled={isLoading}
        className={`border-muted-foreground/20 hover:border-muted-foreground/40 h-full w-full border-2 border-dashed opacity-0 transition-opacity group-hover:opacity-100 ${isLoading ? "cursor-not-allowed" : ""} `}
        aria-label="Adicionar alocação"
      >
        {/* Ícone de adicionar */}
        <Plus className="text-muted-foreground h-4 w-4" />
      </Button>
    </div>
  )
}
