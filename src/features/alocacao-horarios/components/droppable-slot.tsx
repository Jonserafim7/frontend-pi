import { useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Ban,
  Users,
  Plus,
  Eye,
  Clock,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState, memo } from "react"

import { type AlocacaoDisplay, createSlotData, canAddTurmaToSlot } from "../types"
import { useDndAlocacao } from "./dnd-provider"
import { useDragValidation } from "../hooks/use-drag-validation"

interface DroppableSlotProps {
  slotId: string
  alocacao?: AlocacaoDisplay
  alocacoes?: AlocacaoDisplay[]
  maxCapacity?: number
}

// Badge compacto para turmas (inspirado no Google Calendar) - OTIMIZADO PARA OVERFLOW
const TurmaBadge = memo(
  ({
    alocacao,
    onRemove,
    isLoading,
  }: {
    alocacao: AlocacaoDisplay
    onRemove: (alocacao: AlocacaoDisplay) => void
    isLoading: boolean
  }) => {
    const [showDetails, setShowDetails] = useState(false)

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog
              open={showDetails}
              onOpenChange={setShowDetails}
            >
              <DialogTrigger asChild>
                <div className="group bg-primary/90 hover:bg-primary text-primary-foreground turma-badge micro-element touch-hover relative flex max-w-full min-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded px-2 py-1 text-xs transition-all duration-200 hover:shadow-md">
                  <BookOpen className="h-2.5 w-2.5 flex-shrink-0" />

                  {/* Texto truncado com largura máxima */}
                  <span className="max-w-[calc(100%-1rem)] min-w-0 truncate font-medium">
                    {alocacao.turma.codigo}
                  </span>

                  {/* Botão de remoção compacto e posicionado */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-destructive hover:bg-destructive/80 text-destructive-foreground absolute -top-1 -right-1 z-10 h-4 w-4 flex-shrink-0 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(alocacao)
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="text-primary h-5 w-5" />
                    Detalhes da Alocação
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Turma
                      </label>
                      <p className="text-primary text-sm font-bold break-words">
                        {alocacao.turma.codigo}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Horário
                      </label>
                      <p className="text-sm break-words">
                        {alocacao.diaDaSemana} {alocacao.horaInicio}-
                        {alocacao.horaFim}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Disciplina
                    </label>
                    <p className="text-sm break-words">
                      {alocacao.turma.disciplina}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <label className="text-muted-foreground text-sm font-medium">
                        Professor
                      </label>
                      <p className="text-sm break-words">
                        {alocacao.turma.professor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Alocação ativa</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onRemove(alocacao)
                        setShowDetails(false)
                      }}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remover
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>

          {/* Tooltip com informações completas */}
          <TooltipContent
            side="top"
            className="max-w-56 p-3"
          >
            <div className="space-y-1">
              <div className="text-sm font-medium">{alocacao.turma.codigo}</div>
              <div className="text-muted-foreground text-xs">
                {alocacao.turma.disciplina}
              </div>
              <div className="text-xs">👨‍🏫 {alocacao.turma.professor}</div>
              <div className="text-xs">
                📅 {alocacao.diaDaSemana} {alocacao.horaInicio}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
)

TurmaBadge.displayName = "TurmaBadge"

export const DroppableSlot = memo(
  ({ slotId, alocacao, alocacoes = [], maxCapacity = 3 }: DroppableSlotProps) => {
    const { handleRemoveAlocacao, isLoading, draggedTurma } = useDndAlocacao()
    const [showRemoveDialog, setShowRemoveDialog] = useState(false)
    const [selectedAlocacao, setSelectedAlocacao] =
      useState<AlocacaoDisplay | null>(null)

    // Hook para validação de bloqueio durante drag
    const { getBlockedSlotStyles, getBlockOverlay, canDrop } =
      useDragValidation(draggedTurma)

    // Criar dados do slot com múltiplas alocações
    const slotData = createSlotData(
      slotId,
      alocacoes.length > 0 ? alocacoes
      : alocacao ? [alocacao]
      : [],
      maxCapacity,
    )

    // Validar se a turma sendo arrastada pode ser adicionada
    const canAddTurma =
      draggedTurma ? canAddTurmaToSlot(slotData, draggedTurma) : { canAdd: true }

    const { setNodeRef, isOver } = useDroppable({
      id: slotId,
      data: {
        slotId,
        alocacoes: slotData.alocacoes,
        slotData,
        canDrop: canDrop(slotId, maxCapacity) && canAddTurma.canAdd,
        maxCapacity,
        currentCount: slotData.alocacoes.length,
      },
    })

    const handleRemove = async () => {
      if (!selectedAlocacao) return

      await handleRemoveAlocacao(selectedAlocacao.id)
      setShowRemoveDialog(false)
      setSelectedAlocacao(null)
    }

    const handleRemoveClick = (alocacao: AlocacaoDisplay) => {
      setSelectedAlocacao(alocacao)
      setShowRemoveDialog(true)
    }

    // Obter estilos de bloqueio quando há drag ativo
    const blockStyles = getBlockedSlotStyles(slotId, maxCapacity)
    const blockOverlay = getBlockOverlay(slotId, maxCapacity)
    const isBlocked = !!blockOverlay || (draggedTurma && !canAddTurma.canAdd)

    const getSlotStyles = () => {
      // Se há drag ativo e slot está bloqueado, aplicar estilos de bloqueio
      if (draggedTurma && (blockStyles || !canAddTurma.canAdd)) {
        return (
          blockStyles ||
          "relative opacity-60 cursor-not-allowed pointer-events-none bg-gray-50 border-gray-200 ring-2 ring-gray-100"
        )
      }

      if (slotData.isOccupied) {
        // Slot ocupado
        if (isOver && !isBlocked) {
          return "bg-primary/10 border-2 border-primary/30 shadow-md"
        }
        return "bg-muted/30 border border-border/50 hover:border-border/70 hover:bg-muted/50"
      }

      if (isOver && !isBlocked) {
        // Hover em slot vazio válido
        return "bg-green-500/10 border-2 border-green-500/30 shadow-md"
      }

      // Slot vazio normal
      return "bg-muted/20 border border-dashed border-border/30 hover:border-border/50 hover:bg-muted/30"
    }

    return (
      <>
        {/* Modal de confirmação de remoção */}
        <AlertDialog
          open={showRemoveDialog}
          onOpenChange={setShowRemoveDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="text-destructive h-5 w-5" />
                Remover Alocação
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja remover a alocação da turma{" "}
                <span className="text-primary font-semibold">
                  {selectedAlocacao?.turma.codigo}
                </span>{" "}
                do horário{" "}
                <span className="font-semibold">
                  {selectedAlocacao?.diaDaSemana} às{" "}
                  {selectedAlocacao?.horaInicio}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ?
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Removendo...
                  </>
                : <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </>
                }
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div
          ref={setNodeRef}
          className={`droppable-slot relative rounded-lg transition-all duration-200 ${getSlotStyles()} ${
            // Dimensões responsivas otimizadas
            "h-16 min-h-[64px] w-full sm:h-18 md:h-20 lg:h-20"
          }`}
          data-dnd-droppable="true"
        >
          {/* Overlay de bloqueio quando slot está indisponível */}
          {(blockOverlay || (draggedTurma && !canAddTurma.canAdd)) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex max-w-full flex-col items-center justify-center p-1 text-center sm:p-2">
                      {blockOverlay ?
                        <>
                          <div
                            className={`rounded-full p-1.5 ${blockOverlay.bgClassName} mb-1 flex-shrink-0 shadow-md`}
                          >
                            <blockOverlay.icon className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                          </div>
                          <div
                            className={`rounded px-1.5 py-0.5 text-xs font-medium text-white ${blockOverlay.bgClassName} max-w-full truncate`}
                          >
                            {blockOverlay.type === "occupied" && "Ocupado"}
                            {blockOverlay.type === "unavailable" &&
                              "Indisponível"}
                            {blockOverlay.type === "conflict" && "Conflito"}
                            {blockOverlay.type === "capacity-exceeded" &&
                              "Lotado"}
                            {blockOverlay.type === "duplicate" && "Duplicado"}
                          </div>
                        </>
                      : <>
                          <div className="mb-1 flex-shrink-0 rounded-full bg-orange-500/90 p-1.5 shadow-md">
                            <Ban className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                          </div>
                          <div className="max-w-full truncate rounded bg-orange-500/90 px-1.5 py-0.5 text-xs font-medium text-white">
                            Não permitido
                          </div>
                        </>
                      }
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-56"
                  >
                    <div className="text-sm">
                      <p className="mb-1 font-medium">
                        {blockOverlay ?
                          <>
                            {blockOverlay.type === "occupied" &&
                              "🚫 Slot Ocupado"}
                            {blockOverlay.type === "unavailable" &&
                              "⏰ Professor Indisponível"}
                            {blockOverlay.type === "conflict" &&
                              "⚠️ Conflito de Horário"}
                            {blockOverlay.type === "capacity-exceeded" &&
                              "📊 Capacidade Excedida"}
                            {blockOverlay.type === "duplicate" &&
                              "🔄 Turma Duplicada"}
                          </>
                        : "🚫 Não Permitido"}
                      </p>
                      <p className="text-muted-foreground text-xs break-words">
                        {blockOverlay?.reason || canAddTurma.reason}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {
            slotData.isOccupied ?
              // Slot com alocações - Layout otimizado para diferentes telas
              <div className="h-full overflow-hidden p-1 sm:p-1.5 md:p-2">
                {/* Header compacto - apenas para múltiplas turmas */}
                {slotData.alocacoes.length > 1 && (
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-muted-foreground flex flex-shrink-0 items-center gap-1 text-xs">
                      <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="text-xs">{slotData.alocacoes.length}</span>
                    </div>
                    {slotData.canAcceptMultiple && (
                      <div className="flex flex-shrink-0 items-center gap-1 text-xs text-green-600">
                        <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de badges de turmas - layout otimizado */}
                <div className="flex h-full flex-col gap-0.5 overflow-hidden sm:gap-1">
                  {/* Slots visíveis baseados no tamanho da tela */}
                  <div className="slot-scroll flex-prevent-overflow min-h-0 flex-1 space-y-0.5 overflow-y-auto sm:space-y-1">
                    {slotData.alocacoes
                      .slice(0, maxCapacity || 3)
                      .map((alocacao, index) => (
                        <div
                          key={alocacao.id}
                          className="min-w-0 flex-shrink-0"
                          style={{
                            // Altura dinâmica baseada no número de alocações
                            maxHeight:
                              slotData.alocacoes.length === 1 ? "auto"
                              : slotData.alocacoes.length === 2 ?
                                "calc(50% - 2px)"
                              : "calc(33.333% - 4px)",
                          }}
                        >
                          <TurmaBadge
                            alocacao={alocacao}
                            onRemove={handleRemoveClick}
                            isLoading={isLoading}
                          />
                        </div>
                      ))}
                  </div>

                  {/* Indicador de overflow - apenas se necessário */}
                  {slotData.alocacoes.length > (maxCapacity || 3) && (
                    <div className="text-muted-foreground bg-muted/50 flex-shrink-0 truncate rounded px-1 py-0.5 text-center text-xs">
                      +{slotData.alocacoes.length - (maxCapacity || 3)} mais
                    </div>
                  )}
                </div>

                {/* Indicador de conflito posicionado */}
                {slotData.conflictInfo?.hasConflict && (
                  <div className="absolute right-1 bottom-1 z-20">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full bg-red-500 p-0.5 shadow-md">
                            <AlertCircle className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Conflito detectado</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              // Slot vazio - layout otimizado
            : <div className="flex h-full items-center justify-center p-2">
                {isOver && !isBlocked ?
                  <div className="flex-shrink-0 text-center">
                    <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                    <span className="truncate text-xs font-medium text-green-700">
                      Soltar aqui
                    </span>
                  </div>
                : !isBlocked ?
                  <div className="flex-shrink-0 text-center opacity-50 transition-opacity hover:opacity-70">
                    <div className="border-muted-foreground/30 mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded border-2 border-dashed sm:h-6 sm:w-6">
                      <div className="bg-muted-foreground/30 h-1.5 w-1.5 rounded-full"></div>
                    </div>
                    <span className="text-muted-foreground truncate text-xs">
                      Vazio
                    </span>
                  </div>
                : null}
              </div>

          }

          {/* Indicador de conflito durante hover em slot inválido */}
          {isOver && isBlocked && (
            <div className="absolute -top-1 -right-1 z-20">
              <div className="bg-destructive flex h-4 w-4 animate-pulse items-center justify-center rounded-full shadow-md sm:h-5 sm:w-5">
                <Ban className="text-destructive-foreground h-2 w-2 sm:h-2.5 sm:w-2.5" />
              </div>
            </div>
          )}
        </div>
      </>
    )
  },
)

DroppableSlot.displayName = "DroppableSlot"
