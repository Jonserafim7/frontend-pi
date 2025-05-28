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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Ban,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"

import { type AlocacaoDisplay } from "../types"
import { useDndAlocacao } from "./dnd-provider"
import { useDragValidation } from "../hooks/use-drag-validation"

interface DroppableSlotProps {
  slotId: string
  alocacao?: AlocacaoDisplay
}

export function DroppableSlot({ slotId, alocacao }: DroppableSlotProps) {
  const { handleRemoveAlocacao, isLoading, draggedTurma } = useDndAlocacao()
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  // Hook para validação de bloqueio durante drag
  const { getBlockedSlotStyles, getBlockOverlay, canDrop } =
    useDragValidation(draggedTurma)

  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: {
      slotId,
      alocacao,
      canDrop: canDrop(slotId), // Informar se o drop é permitido
    },
  })

  const handleRemove = async () => {
    if (!alocacao) return

    await handleRemoveAlocacao(alocacao.id)
    setShowRemoveDialog(false)
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowRemoveDialog(true)
  }

  // Obter estilos de bloqueio quando há drag ativo
  const blockStyles = getBlockedSlotStyles(slotId)
  const blockOverlay = getBlockOverlay(slotId)
  const isBlocked = !!blockOverlay

  const getSlotStyles = () => {
    // Se há drag ativo e slot está bloqueado, aplicar estilos de bloqueio
    if (draggedTurma && blockStyles) {
      return blockStyles
    }

    if (alocacao) {
      // Slot ocupado
      if (isOver && !isBlocked) {
        return "bg-primary/20 border-2 border-primary shadow-lg scale-105"
      }
      return "bg-primary/10 border border-primary/20 shadow-sm hover:shadow-md"
    }

    if (isOver && !isBlocked) {
      // Hover em slot vazio válido
      return "bg-green-500/10 border-2 border-green-500/30 shadow-lg scale-105"
    }

    // Slot vazio normal
    return "bg-muted/50 border border-border hover:border-border/70 hover:bg-muted/70 transition-all duration-200"
  }

  return (
    <div
      ref={setNodeRef}
      className={`relative h-20 w-full rounded-xl transition-all duration-300 ${getSlotStyles()} `}
    >
      {/* Overlay de bloqueio quando slot está indisponível */}
      {blockOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  {/* Ícone com fundo colorido */}
                  <div
                    className={`rounded-full p-2 ${blockOverlay.bgClassName} mb-2 shadow-lg`}
                  >
                    <blockOverlay.icon className={`h-5 w-5 text-white`} />
                  </div>
                  {/* Badge de status */}
                  <div
                    className={`rounded-md border px-2 py-1 text-xs font-medium text-white ${blockOverlay.borderClassName} ${blockOverlay.bgClassName}`}
                  >
                    {blockOverlay.type === "occupied" && "Ocupado"}
                    {blockOverlay.type === "unavailable" && "Indisponível"}
                    {blockOverlay.type === "conflict" && "Conflito"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-56"
                sideOffset={8}
              >
                <div className="text-sm">
                  <p className="mb-1 font-medium">
                    {blockOverlay.type === "occupied" && "🚫 Slot Ocupado"}
                    {blockOverlay.type === "unavailable" &&
                      "⏰ Professor Indisponível"}
                    {blockOverlay.type === "conflict" && "⚠️ Conflito de Horário"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {blockOverlay.reason}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {
        alocacao ?
          // Slot com alocação
          <div className="group relative flex h-full flex-col justify-between p-3">
            {/* Modal de confirmação de remoção */}
            <AlertDialog
              open={showRemoveDialog}
              onOpenChange={setShowRemoveDialog}
            >
              <AlertDialogTrigger asChild>
                {/* Botão de remoção */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={handleRemoveClick}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remover alocação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Trash2 className="text-destructive h-5 w-5" />
                    Remover Alocação
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza que deseja remover a alocação da turma{" "}
                    <span className="text-primary font-semibold">
                      {alocacao.turma.codigo}
                    </span>{" "}
                    do horário{" "}
                    <span className="font-semibold">
                      {alocacao.diaDaSemana} às {alocacao.horaInicio}
                    </span>
                    ?
                    <br />
                    <br />
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>
                    Cancelar
                  </AlertDialogCancel>
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

            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1">
                  <BookOpen className="text-primary h-3 w-3 flex-shrink-0" />
                  <span className="text-primary truncate text-sm font-bold">
                    {alocacao.turma.codigo}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                  <span className="text-muted-foreground truncate text-xs">
                    {alocacao.turma.professor}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
            </div>

            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary max-w-full self-start text-xs"
            >
              <span className="truncate">
                {alocacao.turma.disciplina.length > 15 ?
                  `${alocacao.turma.disciplina.substring(0, 15)}...`
                : alocacao.turma.disciplina}
              </span>
            </Badge>
          </div>
          // Slot vazio
        : <div className="flex h-full items-center justify-center">
            {isOver && !isBlocked ?
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Soltar aqui
                </span>
              </div>
            : !blockOverlay ?
              <div className="text-center transition-opacity hover:opacity-100">
                <div className="border-accent-foreground/40 mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed">
                  <div className="bg-accent-foreground/40 h-2 w-2 rounded-full"></div>
                </div>
                <span className="text-accent-foreground/40 text-xs">Vazio</span>
              </div>
            : null}
          </div>

      }

      {/* Indicador de conflito durante hover em slot inválido */}
      {isOver && isBlocked && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="bg-destructive flex h-6 w-6 animate-pulse items-center justify-center rounded-full shadow-lg">
            <Ban className="text-destructive-foreground h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  )
}
