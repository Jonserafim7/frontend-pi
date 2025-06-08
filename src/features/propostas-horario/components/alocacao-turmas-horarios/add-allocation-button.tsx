"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddAllocationButtonProps {
  /**
   * Callback para quando o botão é clicado
   */
  onClick: () => void
  /**
   * Se o botão está desabilitado (estados de loading, sem permissão, etc.)
   */
  disabled?: boolean
  /**
   * Tamanho do botão baseado no espaço disponível
   */
  size?: "small" | "medium" | "large"
  /**
   * Tooltip explicativo
   */
  tooltip?: string
  /**
   * Razão pela qual o botão está desabilitado (para tooltip específico)
   */
  disabledReason?: string
  /**
   * Estado específico do botão
   */
  state?: "default" | "loading" | "disabled" | "readonly"
  /**
   * Data test id para testes automatizados
   */
  "data-testid"?: string
  /**
   * Classe adicional para customização
   */
  className?: string
}

/**
 * Botão minimalista "+" para adicionar novas alocações na grade de horários.
 *
 * Características:
 * - Design minimalista com ícone + destacado
 * - Posicionado na parte inferior da célula
 * - Estados visuais claros (enabled/disabled)
 * - Diferentes tamanhos baseados no espaço disponível
 * - Tooltip explicativo
 * - Acessibilidade completa
 *
 * @component
 */
export function AddAllocationButton({
  onClick,
  disabled = false,
  size = "medium",
  tooltip = "Adicionar nova alocação",
  disabledReason,
  state = "default",
  "data-testid": dataTestId,
  className = "",
}: AddAllocationButtonProps) {
  // Classes de tamanho responsivas
  const sizeClasses = {
    small: {
      container: "h-3 sm:h-4",
      icon: "h-2 w-2",
      text: "text-[8px]",
    },
    medium: {
      container: "h-4 sm:h-5 lg:h-6",
      icon: "h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4",
      text: "text-[10px] sm:text-xs",
    },
    large: {
      container: "h-5 sm:h-6 lg:h-8",
      icon: "h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5",
      text: "text-xs sm:text-sm",
    },
  }

  const currentSize = sizeClasses[size]

  // Determinar estado real baseado em props
  const actualState = disabled ? "disabled" : state
  const isDisabled =
    actualState === "disabled" ||
    actualState === "loading" ||
    actualState === "readonly"

  // Classes baseadas no estado
  const getStateClasses = () => {
    switch (actualState) {
      case "loading":
        return `
          border-muted-foreground/20 text-muted-foreground/60
          bg-muted/10 cursor-wait opacity-75
          hover:border-muted-foreground/20 hover:bg-muted/10
        `
      case "disabled":
        return `
          border-muted-foreground/10 text-muted-foreground/40
          cursor-not-allowed opacity-50
          hover:border-muted-foreground/10 hover:bg-transparent
        `
      case "readonly":
        return `
          border-muted-foreground/15 text-muted-foreground/50
          cursor-default opacity-60
          hover:border-muted-foreground/15 hover:bg-transparent
        `
      default: // "default"
        return `
          border-muted-foreground/20 text-muted-foreground
          hover:border-muted-foreground/40 hover:bg-muted/20
          hover:scale-[1.02] active:scale-[0.98]
        `
    }
  }

  // Classes base do botão
  const baseClasses = `
    w-full  transition-all duration-200
    ${currentSize.container}
    ${getStateClasses()}
    ${className}
  `

  const buttonElement = (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isDisabled}
      className={baseClasses}
      aria-label={tooltip}
      data-testid={dataTestId || "add-allocation-btn"}
    >
      <Plus className={currentSize.icon} />
      {/* Texto responsivo baseado no tamanho */}
      {size === "medium" && (
        <>
          <span className={`ml-1 hidden sm:inline lg:hidden ${currentSize.text}`}>
            Add
          </span>
          <span className={`ml-1 hidden lg:inline ${currentSize.text}`}>
            Adicionar
          </span>
        </>
      )}
      {size === "large" && (
        <span className={`ml-1 ${currentSize.text}`}>Adicionar</span>
      )}
    </Button>
  )

  // Determinar tooltip baseado no estado
  const getTooltipText = () => {
    if (disabledReason && isDisabled) {
      return disabledReason
    }
    if (actualState === "loading") {
      return "Carregando... Aguarde"
    }
    if (actualState === "readonly") {
      return "Visualização somente leitura"
    }
    return tooltip
  }

  const tooltipText = getTooltipText()

  // Se tooltip está definido, envolver com TooltipProvider
  if (tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonElement
}
