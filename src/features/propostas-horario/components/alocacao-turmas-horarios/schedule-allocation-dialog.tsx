"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type {
  AulaHorarioDto,
  AlocacaoHorarioResponseDto,
} from "@/api-generated/model"
import type { DiaSemanaKey } from "../../types/proposta-allocation-types"

interface ScheduleAllocationDialogProps {
  /**
   * Controla se o dialog está aberto ou fechado
   */
  open: boolean
  /**
   * Callback para quando o estado do dialog muda
   */
  onOpenChange: (open: boolean) => void
  /**
   * Dia da semana da célula selecionada
   */
  dia: DiaSemanaKey
  /**
   * Horário da célula selecionada
   */
  horario: AulaHorarioDto
  /**
   * Alocações existentes para esta célula
   */
  alocacoesExistentes?: AlocacaoHorarioResponseDto[]
  /**
   * Lista de turmas disponíveis para alocação
   */
  turmasDisponiveis?: Array<{
    id: string
    codigo: string
    disciplina: string
    professor?: string
  }>
  /**
   * Callback chamado quando uma alocação é adicionada
   */
  onAlocarTurma?: (turmaId: string) => Promise<void>
  /**
   * Callback chamado quando uma alocação é removida
   */
  onRemoverAlocacao?: (alocacaoId: string) => void
  /**
   * Estado de loading da criação (do react-query)
   */
  isCreating?: boolean
  /**
   * Estado de loading da validação (do react-query)
   */
  isValidating?: boolean
  /**
   * Último erro de alocação
   */
  lastError?: string | null
}

/**
 * Dialog para gerenciar alocações de turmas em um slot específico da grade de horários.
 *
 * Permite:
 * - Visualizar alocações existentes no slot
 * - Adicionar novas turmas ao slot via combobox
 * - Remover alocações existentes
 * - Validação de conflitos de horários
 *
 * @example
 * <ScheduleAllocationDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   dia="SEGUNDA"
 *   horario={{ inicio: "08:00", fim: "08:50" }}
 *   alocacoesExistentes={alocacoes}
 *   turmasDisponiveis={turmas}
 *   onAlocarTurma={handleAlocar}
 *   onRemoverAlocacao={handleRemover}
 *   isCreating={isCreating}
 *   isValidating={isValidating}
 *   lastError={lastError}
 * />
 */
export function ScheduleAllocationDialog({
  open,
  onOpenChange,
  dia,
  horario,
  alocacoesExistentes = [],
  turmasDisponiveis = [],
  onAlocarTurma,
  onRemoverAlocacao,
  isCreating = false,
  isValidating = false,
  lastError = null,
}: ScheduleAllocationDialogProps) {
  const [openCombobox, setOpenCombobox] = React.useState(false)
  const [selectedTurma, setSelectedTurma] = React.useState("")

  // Mapear dias da semana para labels em português
  const diaLabels: Record<DiaSemanaKey, string> = {
    SEGUNDA: "Segunda-feira",
    TERCA: "Terça-feira",
    QUARTA: "Quarta-feira",
    QUINTA: "Quinta-feira",
    SEXTA: "Sexta-feira",
    SABADO: "Sábado",
  }

  /**
   * Filtra turmas que não estão alocadas neste slot
   */
  const turmasNaoAlocadas = React.useMemo(() => {
    const idsAlocados = new Set(
      alocacoesExistentes.map((alocacao) => alocacao.idTurma),
    )
    return turmasDisponiveis.filter((turma) => !idsAlocados.has(turma.id))
  }, [turmasDisponiveis, alocacoesExistentes])

  /**
   * Reset state quando dialog fecha
   */
  React.useEffect(() => {
    if (!open) {
      setSelectedTurma("")
      setOpenCombobox(false)
    }
  }, [open])

  /**
   * Adiciona uma turma ao slot
   */
  const handleAdicionarTurma = async () => {
    if (!selectedTurma || !onAlocarTurma || isCreating || isValidating) return

    try {
      await onAlocarTurma(selectedTurma)
      // Se sucesso, limpar seleção (o dialog fechará automaticamente via onOpenChange no container)
      setSelectedTurma("")
      setOpenCombobox(false)
    } catch (err) {
      // O erro já é tratado no hook/container, aqui só logamos
      console.error("❌ [ScheduleAllocationDialog] Erro ao alocar turma:", err)
    }
  }

  /**
   * Remove uma alocação do slot
   */
  const handleRemoverAlocacao = (alocacaoId: string) => {
    if (onRemoverAlocacao) {
      onRemoverAlocacao(alocacaoId)
    }
  }

  const isLoading = isCreating || isValidating

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Alocações - {diaLabels[dia]}</DialogTitle>
          <DialogDescription>
            {horario.inicio} às {horario.fim} - Adicione ou remova turmas neste
            horário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exibir erro se houver */}
          {lastError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lastError}</AlertDescription>
            </Alert>
          )}

          {/* Alocações existentes */}
          {alocacoesExistentes.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Turmas Alocadas:</h4>
              <div className="space-y-2">
                {alocacoesExistentes.map((alocacao) => (
                  <div
                    key={alocacao.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {alocacao.turma.disciplinaOfertada.disciplina.nome}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {alocacao.turma.codigoDaTurma} -{" "}
                        {alocacao.turma.professorAlocado?.nome ||
                          "Professor não definido"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverAlocacao(alocacao.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover alocação</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combobox para adicionar nova turma */}
          {turmasNaoAlocadas.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Adicionar Turma:</h4>
              <div className="flex gap-2">
                <Popover
                  open={openCombobox}
                  onOpenChange={setOpenCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="flex-1 justify-between"
                      disabled={isLoading}
                    >
                      {selectedTurma ?
                        turmasNaoAlocadas.find(
                          (turma) => turma.id === selectedTurma,
                        )?.codigo
                      : "Selecionar turma..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar turma..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma turma encontrada.</CommandEmpty>
                        <CommandGroup>
                          {turmasNaoAlocadas.map((turma) => (
                            <CommandItem
                              key={turma.id}
                              value={turma.id}
                              onSelect={(currentValue) => {
                                setSelectedTurma(
                                  currentValue === selectedTurma ? "" : (
                                    currentValue
                                  ),
                                )
                                setOpenCombobox(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTurma === turma.id ?
                                    "opacity-100"
                                  : "opacity-0",
                                )}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{turma.codigo}</div>
                                <div className="text-muted-foreground text-sm">
                                  {turma.disciplina}
                                  {turma.professor && ` - ${turma.professor}`}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handleAdicionarTurma}
                  disabled={!selectedTurma || isLoading}
                >
                  {isValidating ?
                    "Validando..."
                  : isCreating ?
                    "Adicionando..."
                  : "Adicionar"}
                </Button>
              </div>
            </div>
          )}

          {/* Mensagem quando não há turmas disponíveis */}
          {turmasNaoAlocadas.length === 0 && alocacoesExistentes.length === 0 && (
            <div className="text-muted-foreground py-4 text-center">
              Nenhuma turma disponível para este horário.
            </div>
          )}

          {turmasNaoAlocadas.length === 0 && alocacoesExistentes.length > 0 && (
            <div className="text-muted-foreground py-2 text-center text-sm">
              Todas as turmas disponíveis já estão alocadas neste horário.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
