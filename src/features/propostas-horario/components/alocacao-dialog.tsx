import * as React from "react"
import { Check, ChevronsUpDown, X, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type {
  AulaHorarioDto,
  AlocacaoHorarioResponseDto,
} from "@/api-generated/model"
import type { DiaSemanaKey } from "./schedule-grid-types"
import { useScheduleAllocation } from "../hooks/use-schedule-allocation"

interface AlocacaoDialogProps {
  propostaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  dia: DiaSemanaKey
  horario: AulaHorarioDto
  alocacoesExistentes?: AlocacaoHorarioResponseDto[]
}

const diaLabels: Record<DiaSemanaKey, string> = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
}

export function AlocacaoDialog({
  propostaId,
  open,
  onOpenChange,
  dia,
  horario,
  alocacoesExistentes = [],
}: AlocacaoDialogProps) {
  const [openCombobox, setOpenCombobox] = React.useState(false)
  const [selectedTurma, setSelectedTurma] = React.useState("")

  const {
    turmas,
    getTurmasDisponiveis,
    getConflitosParaTurma,
    criarAlocacao,
    removerAlocacao,
    isCreating,
    isDeleting,
  } = useScheduleAllocation({ propostaId })

  const turmasDisponiveis = React.useMemo(() => {
    return getTurmasDisponiveis(
      dia,
      horario.inicio,
      horario.fim,
      alocacoesExistentes,
    )
  }, [
    getTurmasDisponiveis,
    dia,
    horario.inicio,
    horario.fim,
    alocacoesExistentes,
  ])

  const turmasNaoAlocadas = React.useMemo(() => {
    const idsAlocados = new Set(
      alocacoesExistentes.map((alocacao) => alocacao.idTurma),
    )
    return turmasDisponiveis.filter((turma) => !idsAlocados.has(turma.id))
  }, [turmasDisponiveis, alocacoesExistentes])

  const handleAdicionarTurma = async () => {
    if (selectedTurma) {
      console.log("🎯 [AlocacaoDialog] Iniciando criação de alocação:", {
        selectedTurma,
        dia,
        horario: `${horario.inicio} - ${horario.fim}`,
        propostaId,
      })

      const turmaEscolhida = turmas.find((t) => t.id === selectedTurma)
      if (turmaEscolhida) {
        // Verificar conflitos antes de criar
        const conflitos = getConflitosParaTurma(
          turmaEscolhida,
          dia,
          horario.inicio,
          horario.fim,
          alocacoesExistentes,
        )

        if (conflitos.basico || conflitos.professor) {
          // Por enquanto vamos apenas logar os conflitos, mas permitir a criação
          console.warn(
            "⚠️ [AlocacaoDialog] Conflitos detectados:",
            conflitos.mensagens,
          )
        }
      }

      try {
        console.log("📞 [AlocacaoDialog] Chamando criarAlocacao...")
        await criarAlocacao(selectedTurma, dia, horario.inicio, horario.fim)
        console.log("✅ [AlocacaoDialog] Alocação criada com sucesso")

        setSelectedTurma("")
        setOpenCombobox(false)
      } catch (error) {
        console.error("❌ [AlocacaoDialog] Erro ao criar alocação:", error)
      }
    }
  }

  const handleRemoverAlocacao = async (alocacaoId: string) => {
    await removerAlocacao(alocacaoId)
  }

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
                      disabled={isDeleting}
                      className="h-8 w-8 p-0"
                      data-testid={`btn-remover-alocacao-${alocacao.turma.codigoDaTurma}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {turmasNaoAlocadas.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Adicionar Turma:</h4>

              {/* Mostrar alerta se turma selecionada tem conflitos */}
              {selectedTurma &&
                (() => {
                  const turmaEscolhida = turmas.find(
                    (t) => t.id === selectedTurma,
                  )
                  if (turmaEscolhida) {
                    const conflitos = getConflitosParaTurma(
                      turmaEscolhida,
                      dia,
                      horario.inicio,
                      horario.fim,
                      alocacoesExistentes,
                    )
                    if (conflitos.basico || conflitos.professor) {
                      return (
                        <Alert className="mb-3 border-amber-200 bg-amber-50">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800">
                            <strong>Conflito detectado:</strong>{" "}
                            {conflitos.mensagens.join(", ")}
                          </AlertDescription>
                        </Alert>
                      )
                    }
                  }
                  return null
                })()}

              <div className="flex gap-2">
                <Popover
                  open={openCombobox}
                  onOpenChange={setOpenCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="flex-1 justify-between"
                      data-testid="btn-selecionar-turma"
                    >
                      {selectedTurma ?
                        turmasNaoAlocadas.find(
                          (turma) => turma.id === selectedTurma,
                        )?.codigoDaTurma
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
                          {turmasNaoAlocadas.map((turma) => {
                            // Verificar conflitos potenciais para mostrar avisos
                            const conflitos = getConflitosParaTurma(
                              turma,
                              dia,
                              horario.inicio,
                              horario.fim,
                              alocacoesExistentes,
                            )
                            const temConflitos =
                              conflitos.basico || conflitos.professor

                            return (
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
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">
                                      {turma.codigoDaTurma}
                                    </div>
                                    {temConflitos && (
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    )}
                                  </div>
                                  <div className="text-muted-foreground text-sm">
                                    {turma.disciplinaOfertada?.disciplina?.nome}
                                  </div>
                                  {turma.professorAlocado && (
                                    <div className="text-muted-foreground text-xs">
                                      Prof: {turma.professorAlocado.nome}
                                    </div>
                                  )}
                                  {temConflitos && (
                                    <div className="mt-1 text-xs text-amber-600">
                                      ⚠️ {conflitos.mensagens.join(", ")}
                                    </div>
                                  )}
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handleAdicionarTurma}
                  disabled={!selectedTurma || isCreating}
                  data-testid="btn-adicionar-turma-dialog"
                >
                  {isCreating ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </div>
          )}

          {turmasNaoAlocadas.length === 0 && alocacoesExistentes.length === 0 && (
            <div className="text-muted-foreground py-4 text-center">
              Nenhuma turma disponível para este horário.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="btn-fechar-dialog"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
