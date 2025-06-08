"use client"

import * as React from "react"
import {
  Check,
  ChevronsUpDown,
  X,
  AlertCircle,
  User,
  Plus,
  CheckCircle,
} from "lucide-react"
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
  const [validationState, setValidationState] = React.useState<{
    isValid: boolean
    conflicts: string[]
    warnings: string[]
  }>({ isValid: true, conflicts: [], warnings: [] })

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
      setValidationState({ isValid: true, conflicts: [], warnings: [] })
    }
  }, [open])

  /**
   * Validação em tempo real quando turma é selecionada - Sub-task 5.4.3
   */
  React.useEffect(() => {
    if (!selectedTurma) {
      setValidationState({ isValid: true, conflicts: [], warnings: [] })
      return
    }

    const turma = turmasNaoAlocadas.find((t) => t.id === selectedTurma)
    if (!turma) return

    const conflicts: string[] = []
    const warnings: string[] = []

    // Verificar se a turma já tem alocação em horário conflitante
    const hasConflict = alocacoesExistentes.some(
      (alocacao) => alocacao.turma.id === selectedTurma,
    )

    if (hasConflict) {
      conflicts.push("Esta turma já está alocada neste horário")
    }

    // Verificar se professor já tem alocação neste horário (exemplo de warning)
    if (turma.professor) {
      const professorConflict = alocacoesExistentes.some(
        (alocacao) => alocacao.turma.professorAlocado?.nome === turma.professor,
      )
      if (professorConflict) {
        warnings.push(
          `Professor ${turma.professor} já tem outra turma neste horário`,
        )
      }
    }

    setValidationState({
      isValid: conflicts.length === 0,
      conflicts,
      warnings,
    })
  }, [selectedTurma, turmasNaoAlocadas, alocacoesExistentes])

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
          {/* Feedback aprimorado de erro - Sub-task 5.4.5 */}
          {lastError && (
            <Alert
              variant="destructive"
              className="border-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Erro ao processar operação:</div>
                <div className="mt-1 text-sm">{lastError}</div>
                <div className="mt-2 text-xs opacity-75">
                  Verifique os dados e tente novamente. Se o problema persistir,
                  contate o suporte.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Feedback de loading global */}
          {(isCreating || isValidating) && (
            <Alert className="border-primary/30 bg-primary/10">
              <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <AlertDescription>
                <div className="font-medium">
                  {isValidating ?
                    "Validando alocação..."
                  : "Processando alocação..."}
                </div>
                <div className="text-primary mt-1 text-sm">
                  {isValidating ?
                    "Verificando conflitos de horário e disponibilidade..."
                  : "Salvando a nova alocação na base de dados..."}
                </div>
              </AlertDescription>
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

          {/* Combobox para adicionar nova turma - Interface melhorada */}
          {turmasNaoAlocadas.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">
                Adicionar Turma ({turmasNaoAlocadas.length} disponível
                {turmasNaoAlocadas.length !== 1 ? "s" : ""}):
              </h4>
              <div>
                <Popover
                  open={openCombobox}
                  onOpenChange={setOpenCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="h-auto min-h-[48px] w-full justify-between p-3"
                      disabled={isLoading}
                    >
                      <div className="flex flex-col items-start text-left">
                        {selectedTurma ?
                          <>
                            <span className="text-sm font-medium">
                              {
                                turmasNaoAlocadas.find(
                                  (turma) => turma.id === selectedTurma,
                                )?.codigo
                              }
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {
                                turmasNaoAlocadas.find(
                                  (turma) => turma.id === selectedTurma,
                                )?.disciplina
                              }
                              {turmasNaoAlocadas.find(
                                (turma) => turma.id === selectedTurma,
                              )?.professor &&
                                ` • ${turmasNaoAlocadas.find((turma) => turma.id === selectedTurma)?.professor}`}
                            </span>
                          </>
                        : <>
                            <span className="text-muted-foreground text-sm">
                              Selecione uma turma para alocar...
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Digite para buscar por código, disciplina ou
                              professor
                            </span>
                          </>
                        }
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Buscar por código, disciplina ou professor..."
                        className="h-12"
                      />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="text-muted-foreground text-sm">
                              Nenhuma turma encontrada
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              Tente buscar por código, nome da disciplina ou
                              professor
                            </div>
                          </div>
                        </CommandEmpty>
                        <CommandGroup
                          heading={`${turmasNaoAlocadas.length} turma${turmasNaoAlocadas.length !== 1 ? "s" : ""} disponível${turmasNaoAlocadas.length !== 1 ? "is" : ""}`}
                        >
                          {turmasNaoAlocadas.map((turma) => (
                            <CommandItem
                              key={turma.id}
                              value={`${turma.codigo} ${turma.disciplina} ${turma.professor || ""}`}
                              onSelect={() => {
                                setSelectedTurma(
                                  turma.id === selectedTurma ? "" : turma.id,
                                )
                                setOpenCombobox(false)
                              }}
                              className="flex cursor-pointer gap-3 p-3"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  selectedTurma === turma.id ?
                                    "opacity-100"
                                  : "opacity-0",
                                )}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {turma.codigo}
                                  </span>
                                  <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                                    {turma.disciplina}
                                  </span>
                                </div>
                                {turma.professor && (
                                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                    <User className="h-3 w-3" />
                                    {turma.professor}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Preview da turma selecionada - Sub-task 5.4.2 */}
                {selectedTurma && (
                  <div className="bg-muted/50 mt-3 rounded-lg border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle className="text-accent-foreground h-5 w-5" />
                      <span className="text-sm font-medium">
                        Turma Selecionada:
                      </span>
                    </div>
                    {(() => {
                      const turma = turmasNaoAlocadas.find(
                        (t) => t.id === selectedTurma,
                      )
                      return (
                        turma && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm font-medium">
                                {turma.codigo}
                              </span>
                              <span className="text-sm">{turma.disciplina}</span>
                            </div>
                            {turma.professor && (
                              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                <User className="h-4 w-4" />
                                Professor: {turma.professor}
                              </div>
                            )}
                            <div className="text-muted-foreground text-xs">
                              Esta turma será alocada no horário de{" "}
                              {horario.inicio} às {horario.fim} na{" "}
                              {diaLabels[dia]}.
                            </div>

                            {/* Informações sobre conflitos - Sub-task 5.4.4 */}
                            {(validationState.conflicts.length > 0 ||
                              validationState.warnings.length > 0) && (
                              <div className="mt-2 space-y-2">
                                {validationState.conflicts.map(
                                  (conflict, index) => (
                                    <Alert
                                      key={`conflict-${index}`}
                                      variant="destructive"
                                      className="py-2"
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription className="text-sm">
                                        {conflict}
                                      </AlertDescription>
                                    </Alert>
                                  ),
                                )}
                                {validationState.warnings.map(
                                  (warning, index) => (
                                    <Alert
                                      key={`warning-${index}`}
                                      className="border-chart-2/30 bg-chart-2/10 py-2"
                                    >
                                      <AlertCircle className="text-chart-2 h-4 w-4" />
                                      <AlertDescription className="text-chart-2 text-sm">
                                        {warning}
                                      </AlertDescription>
                                    </Alert>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )
                    })()}
                  </div>
                )}
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

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Fechar
          </Button>
          {turmasNaoAlocadas.length > 0 && (
            <Button
              onClick={handleAdicionarTurma}
              disabled={!selectedTurma || isLoading || !validationState.isValid}
              className="flex-1"
              variant={!validationState.isValid ? "destructive" : "default"}
            >
              {isValidating ?
                <>
                  <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Validando...
                </>
              : isCreating ?
                <>
                  <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Adicionando...
                </>
              : <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </>
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
