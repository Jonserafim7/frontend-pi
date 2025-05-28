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
import { createContext, useContext, useState, useCallback, useMemo } from "react"
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
  createSlotData,
  canAddTurmaToSlot,
} from "../types"

interface DndContextType {
  activeId: string | null
  draggedTurma: TurmaDisplay | null
  alocacoes: AlocacaoDisplay[]
  turmas: TurmaDisplay[]
  handleDrop: (
    turmaId: string,
    slotId: string,
    maxCapacity?: number,
  ) => Promise<void>
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

  // Configuração de sensores otimizada para performance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Reduzir distância para ativação mais rápida
      },
    }),
  )

  // Memoizar função para encontrar turma por ID
  const findTurmaById = useMemo(() => {
    const turmaMap = new Map(turmas.map((t) => [t.id, t]))
    return (id: string) => turmaMap.get(id)
  }, [turmas])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const turmaId = active.id as string

      setActiveId(turmaId)

      const turma = findTurmaById(turmaId)
      setDraggedTurma(turma || null)

      // Feedback visual otimizado
      document.body.style.cursor = "grabbing"

      // Adicionar classe CSS para indicar drag ativo (evita re-renders)
      document.body.classList.add("is-dragging")
    },
    [findTurmaById],
  )

  // Otimizar drag over - reduzir cálculos
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Só executar validações essenciais durante drag over
    // Validações complexas ficam no validateSlot do hook
  }, [])

  const handleDrop = useCallback(
    async (turmaId: string, slotId: string, maxCapacity: number = 3) => {
      const [dia, hora, turno] = slotId.split("-")
      const turma = findTurmaById(turmaId)

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

      // Validar se a turma pode ser adicionada ao slot (múltiplas turmas)
      const slotData = createSlotData(slotId, alocacoes, maxCapacity)
      const canAddResult = canAddTurmaToSlot(slotData, turma)

      if (!canAddResult.canAdd) {
        toast({
          title: "Alocação não permitida",
          description:
            canAddResult.reason ||
            "Não é possível alocar esta turma neste horário",
          variant: "destructive",
        })
        return
      }

      // Verificar se a turma já está alocada neste exato slot
      const existingAlocacao = alocacoes.find(
        (a) =>
          a.turmaId === turmaId &&
          a.diaDaSemana === dia &&
          a.horaInicio === hora &&
          a.turno === turno,
      )

      if (existingAlocacao) {
        toast({
          title: "Turma já alocada",
          description: `${turma.codigo} já está alocada neste horário`,
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

        // Mensagem de sucesso diferenciada para múltiplas turmas
        const currentCount = slotData.alocacoes.length + 1
        const successMessage =
          currentCount === 1 ?
            `${turma.codigo} alocada para ${dia} ${hora}`
          : `${turma.codigo} adicionada ao slot ${dia} ${hora} (${currentCount}/${maxCapacity} turmas)`

        toast({
          title: "✅ Alocação realizada",
          description: successMessage,
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
    [findTurmaById, alocacoes, createWithValidation, toast],
  )

  const handleRemoveAlocacao = useCallback(
    async (alocacaoId: string) => {
      try {
        await deleteMutation.mutateAsync({ id: alocacaoId })

        toast({
          title: "✅ Alocação removida",
          description: "A alocação foi removida com sucesso",
        })
      } catch (error) {
        console.error("Erro ao remover alocação:", error)
        toast({
          title: "Erro ao remover",
          description: "Não foi possível remover a alocação",
          variant: "destructive",
        })
      }
    },
    [deleteMutation, toast],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      // Limpar estado
      setActiveId(null)
      setDraggedTurma(null)
      document.body.style.cursor = ""
      document.body.classList.remove("is-dragging")

      if (!over || !draggedTurma) return

      await handleDrop(draggedTurma.id, over.id as string)
    },
    [draggedTurma, handleDrop],
  )

  // Função utilitária memoizada
  const getHoraFim = useCallback((horaInicio: string): string => {
    const [hora, minuto] = horaInicio.split(":").map(Number)

    // Aulas de 50 minutos
    let novaHora = hora
    let novoMinuto = minuto + 50

    if (novoMinuto >= 60) {
      novaHora += 1
      novoMinuto -= 60
    }

    return `${novaHora.toString().padStart(2, "0")}:${novoMinuto.toString().padStart(2, "0")}`
  }, [])

  // Memoizar contexto para evitar re-renders desnecessários
  const contextValue = useMemo(
    (): DndContextType => ({
      activeId,
      draggedTurma,
      alocacoes,
      turmas,
      handleDrop,
      handleRemoveAlocacao,
      isLoading,
    }),
    [
      activeId,
      draggedTurma,
      alocacoes,
      turmas,
      handleDrop,
      handleRemoveAlocacao,
      isLoading,
    ],
  )

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
        <DragOverlay dropAnimation={null}>
          {activeId && draggedTurma && (
            <DraggedTurmaOverlay turma={draggedTurma} />
          )}
        </DragOverlay>
      </DndContext>
    </DndAlocacaoContext.Provider>
  )
}
