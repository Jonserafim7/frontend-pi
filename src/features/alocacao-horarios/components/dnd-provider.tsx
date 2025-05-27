"use client"

import type React from "react"

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { createContext, useContext, useState, useCallback } from "react"
import { DraggedTurmaOverlay } from "./dragged-turma-overlay"
import { useToast } from "@/hooks/use-toast"
import { useTurmasAlocacao } from "../hooks/use-turmas-alocacao"
import {
  useAlocacoes,
  useCreateAlocacaoWithValidation,
  useDeleteAlocacao,
} from "../hooks/use-alocacoes"
import {
  mapDiaSemanaToApi,
  type TurmaDisplay,
  type AlocacaoDisplay,
} from "../types"

interface DndContextType {
  activeId: string | null
  draggedTurma: TurmaDisplay | null
  alocacoes: AlocacaoDisplay[]
  turmas: TurmaDisplay[]
  handleDrop: (turmaId: string, slotId: string) => Promise<void>
  handleRemoveAlocacao: (alocacaoId: string) => Promise<void>
  isLoading: boolean
}

const DndAlocacaoContext = createContext<DndContextType | null>(null)

export function useDndAlocacao() {
  const context = useContext(DndAlocacaoContext)
  if (!context) {
    throw new Error("useDndAlocacao must be used within DndProvider")
  }
  return context
}

export function DndProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedTurma, setDraggedTurma] = useState<TurmaDisplay | null>(null)
  const { toast } = useToast()

  // Hooks da API real
  const { data: turmas = [], isLoading: turmasLoading } = useTurmasAlocacao()
  const { data: alocacoes = [], isLoading: alocacoesLoading } = useAlocacoes()
  const { createWithValidation, isLoading: createLoading } =
    useCreateAlocacaoWithValidation()
  const deleteMutation = useDeleteAlocacao()

  const isLoading =
    turmasLoading || alocacoesLoading || createLoading || deleteMutation.isPending

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      setActiveId(active.id as string)

      const turma = turmas.find((t) => t.id === active.id)
      setDraggedTurma(turma || null)

      document.body.style.cursor = "grabbing"
    },
    [turmas],
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Validação em tempo real durante hover se necessário
  }, [])

  const handleDrop = useCallback(
    async (turmaId: string, slotId: string) => {
      const [dia, hora, turno] = slotId.split("-")
      const turma = turmas.find((t) => t.id === turmaId)

      if (!turma) {
        toast({
          title: "Erro",
          description: "Turma não encontrada",
          variant: "destructive",
        })
        return
      }

      if (turma.status === "sem-professor") {
        toast({
          title: "Alocação não permitida",
          description: "Turma sem professor não pode ser alocada",
          variant: "destructive",
        })
        return
      }

      try {
        // Calcular hora fim (50 minutos de aula)
        const horaFim = getHoraFim(hora)

        // Converter dia da semana para formato da API
        const diaDaSemana = mapDiaSemanaToApi(dia)

        await createWithValidation({
          idTurma: turmaId,
          diaDaSemana,
          horaInicio: hora,
          horaFim,
        })

        toast({
          title: "Alocação realizada",
          description: `${turma.codigo} alocada para ${dia} ${hora}`,
        })
      } catch (error: any) {
        console.error("Erro ao criar alocação:", error)
        toast({
          title: "Erro ao alocar",
          description: error.message || "Erro inesperado",
          variant: "destructive",
        })
      }
    },
    [turmas, createWithValidation, toast],
  )

  const handleRemoveAlocacao = useCallback(
    async (alocacaoId: string) => {
      try {
        await deleteMutation.mutateAsync({ id: alocacaoId })
      } catch (error) {
        console.error("Erro ao remover alocação:", error)
      }
    },
    [deleteMutation],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      setActiveId(null)
      setDraggedTurma(null)
      document.body.style.cursor = ""

      if (!over || !draggedTurma) return

      await handleDrop(draggedTurma.id, over.id as string)
    },
    [draggedTurma, handleDrop],
  )

  function getHoraFim(horaInicio: string): string {
    const [hora, minuto] = horaInicio.split(":").map(Number)

    // Aulas de 50 minutos
    let novaHora = hora
    let novoMinuto = minuto + 50

    if (novoMinuto >= 60) {
      novaHora += 1
      novoMinuto -= 60
    }

    return `${novaHora.toString().padStart(2, "0")}:${novoMinuto.toString().padStart(2, "0")}`
  }

  const contextValue: DndContextType = {
    activeId,
    draggedTurma,
    alocacoes,
    turmas,
    handleDrop,
    handleRemoveAlocacao,
    isLoading,
  }

  return (
    <DndAlocacaoContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {children}
        <DragOverlay>
          {activeId && draggedTurma && (
            <DraggedTurmaOverlay turma={draggedTurma} />
          )}
        </DragOverlay>
      </DndContext>
    </DndAlocacaoContext.Provider>
  )
}
