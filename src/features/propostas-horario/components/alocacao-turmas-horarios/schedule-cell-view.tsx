"use client"

import { AllocationCard } from "./allocation-card"
import { AddAllocationButton } from "./add-allocation-button"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

interface ScheduleCellViewProps {
  /**
   * Lista de alocações existentes para o slot
   */
  alocacoes?: AlocacaoHorarioResponseDto[]
  /**
   * Callback para quando a célula é clicada (para adicionar)
   */
  onAddClick: () => void
  /**
   * Callback para quando uma alocação é removida
   */
  onRemoveClick?: (alocacaoId: string) => void
  /**
   * Se a célula está em estado de loading
   */
  isLoading?: boolean
  /**
   * Se o usuário pode editar (adicionar/remover alocações)
   */
  canEdit?: boolean
  /**
   * Se a célula está em modo visualização apenas (readonly)
   */
  readonly?: boolean
  /**
   * Data test id para testes automatizados
   */
  "data-testid"?: string
}

/**
 * Componente de apresentação para célula da grade de horários.
 *
 * Suporta múltiplas alocações em um mesmo slot com:
 * - Container com altura responsiva que se adapta ao conteúdo
 * - Scrolling automático em caso de overflow
 * - Cards compactos para cada turma alocada
 * - Layout responsivo para mobile/tablet/desktop
 * - Adaptação dinâmica baseada na quantidade de alocações
 *
 * @component
 */
export function ScheduleCellView({
  alocacoes = [],
  onAddClick,
  onRemoveClick,
  isLoading = false,
  canEdit = true,
  readonly = false,
  "data-testid": dataTestId,
}: ScheduleCellViewProps) {
  const hasAlocacoes = alocacoes.length > 0
  const numAlocacoes = alocacoes.length

  /**
   * Determina o tamanho do botão baseado no espaço disponível
   * - small: quando há muitas alocações (3+)
   * - medium: normal (1-2 alocações ou vazio)
   * - large: quando há muito espaço (célula vazia e grid grande)
   */
  const getButtonSize = (): "small" | "medium" | "large" => {
    if (numAlocacoes >= 3) return "small"
    if (numAlocacoes === 0) return "medium" // Pode ser "large" no futuro se detectarmos tela grande
    return "medium"
  }

  return (
    <div
      className="relative border-r p-0.5 last:border-r-0 sm:p-1 lg:p-1.5"
      data-testid={dataTestId}
    >
      {/* Container com altura responsiva e scrolling automático */}
      <div
        className={`border-muted/20 flex h-32 max-h-40 min-h-[128px] flex-col overflow-hidden rounded-md border sm:h-36 sm:min-h-[144px] lg:h-40 lg:min-h-[300px]`}
      >
        {/* Área de alocações com scroll automático */}
        <div className="flex-1 space-y-0.5 overflow-y-auto p-1 sm:space-y-1 sm:p-1.5 lg:space-y-1.5 lg:p-2">
          {hasAlocacoes ?
            /* Cards de turmas alocadas usando AllocationCard */
            alocacoes.map((alocacao) => (
              <AllocationCard
                key={alocacao.id}
                alocacao={alocacao}
                onRemove={canEdit && !readonly ? onRemoveClick : undefined}
                isLoading={isLoading}
                showRemoveButton={canEdit && !readonly}
                readonly={!canEdit || readonly}
                size="normal"
                hideTeacherWhenCrowded={true}
                totalAllocations={numAlocacoes}
                data-testid={`allocation-card-${alocacao.id}`}
              />
            ))
          : /* Mensagem quando não há alocações */
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <span className="text-center text-[10px] sm:text-xs lg:text-sm">
                <span className="block sm:hidden">Vazio</span>
                <span className="hidden sm:block lg:hidden">Nenhuma turma</span>
                <span className="hidden lg:block">Nenhuma turma alocada</span>
              </span>
            </div>
          }
        </div>

        {/* Botão + fixo na parte inferior */}
        {canEdit && !readonly && (
          <div className="border-muted/20 border-t p-0.5 sm:p-1">
            <AddAllocationButton
              onClick={onAddClick}
              disabled={isLoading}
              state={isLoading ? "loading" : "default"}
              size={getButtonSize()}
              tooltip="Clique para adicionar uma nova turma a este horário"
              disabledReason={
                isLoading ? "Aguarde a operação atual terminar" : undefined
              }
              data-testid={
                dataTestId ? `${dataTestId}-add-btn` : "add-allocation-btn"
              }
            />
          </div>
        )}

        {/* Mostrar botão em modo readonly se não pode editar ou está readonly */}
        {(!canEdit || readonly) && (
          <div className="border-muted/20 border-t p-0.5 sm:p-1">
            <AddAllocationButton
              onClick={() => {}} // Noop
              disabled={true}
              state="readonly"
              size={getButtonSize()}
              tooltip="Visualização somente leitura"
              disabledReason={
                readonly ?
                  "Esta proposta está em modo de visualização apenas"
                : "Você não tem permissão para editar esta proposta"
              }
              data-testid={
                dataTestId ?
                  `${dataTestId}-readonly-btn`
                : "readonly-allocation-btn"
              }
            />
          </div>
        )}
      </div>

      {/* Overlay de loading responsivo */}
      {isLoading && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center rounded-md">
          <div className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">
            <span className="block sm:hidden">...</span>
            <span className="hidden sm:block">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  )
}
