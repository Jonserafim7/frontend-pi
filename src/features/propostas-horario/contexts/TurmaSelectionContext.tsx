import React, { createContext, useContext, useState, useCallback } from "react"
import type {
  TurmaParaAlocacao,
  TurmaSelecionada,
  TurmaSelectionContext as TurmaSelectionContextType,
} from "../types"

// Criar o contexto
const TurmaSelectionContext = createContext<TurmaSelectionContextType | null>(
  null,
)

// Props do provider
interface TurmaSelectionProviderProps {
  children: React.ReactNode
}

/**
 * Provider para gerenciar o estado de seleção de turmas
 */
export function TurmaSelectionProvider({
  children,
}: TurmaSelectionProviderProps) {
  const [turmaSelecionada, setTurmaSelecionada] =
    useState<TurmaSelecionada | null>(null)

  // Selecionar uma turma
  const selecionarTurma = useCallback((turma: TurmaParaAlocacao) => {
    setTurmaSelecionada({
      turma,
      selecionadaEm: new Date(),
    })
  }, [])

  // Limpar seleção
  const limparSelecao = useCallback(() => {
    setTurmaSelecionada(null)
  }, [])

  // Verificar se uma turma está selecionada
  const isSelecionada = useCallback(
    (turmaId: string) => {
      return turmaSelecionada?.turma.id === turmaId
    },
    [turmaSelecionada],
  )

  const contextValue: TurmaSelectionContextType = {
    turmaSelecionada,
    selecionarTurma,
    limparSelecao,
    isSelecionada,
  }

  return (
    <TurmaSelectionContext.Provider value={contextValue}>
      {children}
    </TurmaSelectionContext.Provider>
  )
}

/**
 * Hook para usar o contexto de seleção de turmas
 */
export function useTurmaSelection() {
  const context = useContext(TurmaSelectionContext)

  if (!context) {
    throw new Error(
      "useTurmaSelection deve ser usado dentro de um TurmaSelectionProvider",
    )
  }

  return context
}

// Exportar o contexto para casos especiais
export { TurmaSelectionContext }
