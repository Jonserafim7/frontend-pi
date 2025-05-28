import React, { useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Loader2 } from "lucide-react"

interface SearchInputProps {
  /** Valor atual da busca */
  value: string
  /** Callback quando o valor muda */
  onChange: (value: string) => void
  /** Callback para limpar a busca */
  onClear: () => void
  /** Se está buscando (mostra loader) */
  isSearching?: boolean
  /** Número de resultados encontrados */
  resultCount?: number
  /** Placeholder do input */
  placeholder?: string
  /** Se deve usar modo compacto */
  compact?: boolean
  /** Referência para o input (para focus management) */
  inputRef?: React.RefObject<HTMLInputElement | null>
  /** Atalho de teclado (padrão: Ctrl+F) */
  shortcut?: string
  /** ID único para acessibilidade */
  id?: string
}

/**
 * Componente de input de busca com debouncing e acessibilidade
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  isSearching = false,
  resultCount,
  placeholder = "Buscar...",
  compact = false,
  inputRef,
  shortcut = "Ctrl+F",
  id = "search-input",
}) => {
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault()
        if (inputRef?.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }

      // Escape to clear search
      if (
        event.key === "Escape" &&
        inputRef?.current === document.activeElement
      ) {
        event.preventDefault()
        onClear()
      }
    },
    [onClear, inputRef],
  )

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  // Handle clear button click
  const handleClear = () => {
    onClear()
  }

  const hasValue = value.length > 0
  const showResultCount = typeof resultCount === "number" && hasValue

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Search Icon */}
        <Search
          className={`text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 ${
            compact ? "h-3 w-3" : "h-4 w-4"
          }`}
        />

        {/* Input Field */}
        <Input
          ref={inputRef}
          id={id}
          type="search"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${compact ? "h-8 text-xs" : "h-10"} pl-10 pr-${hasValue ? "10" : "4"}`}
          aria-label="Campo de busca"
          aria-describedby={`${id}-description ${id}-results`}
          autoComplete="off"
        />

        {/* Loading Indicator */}
        {isSearching && (
          <Loader2
            className={`text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 animate-spin ${
              compact ? "h-3 w-3" : "h-4 w-4"
            }`}
          />
        )}

        {/* Clear Button */}
        {hasValue && !isSearching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={`hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0`}
            aria-label="Limpar busca"
            title="Limpar busca (Esc)"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Info */}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <div id={`${id}-description`}>
          Atalho: <kbd className="bg-muted rounded px-1 py-0.5">{shortcut}</kbd>
        </div>

        {showResultCount && (
          <div
            id={`${id}-results`}
            aria-live="polite"
          >
            <Badge
              variant="outline"
              className="text-xs"
            >
              {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchInput
