import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScheduleGrid } from "./ScheduleGrid"
import { ConflictIndicator, ConflictList } from "./ConflictIndicator"
import { useConflicts } from "../hooks/useConflicts"
import { useValidateAlocacaoMutation } from "../hooks/useValidateAlocacaoMutation"
import { useCreateAlocacaoMutation } from "../hooks/useCreateAlocacaoMutation"
import { useDeleteAlocacaoMutation } from "../hooks/useDeleteAlocacaoMutation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
import type {
  ConfiguracaoHorarioDto,
  AlocacaoHorarioResponseDto,
  AlocacaoHorarioResponseDtoDiaDaSemana,
  ValidateAlocacaoDto,
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoResponseDtoDetails,
} from "@/api-generated/model"

// Componente para exibir detalhes da validação no toast
const ValidationDetailsList: React.FC<{
  details: ValidateAlocacaoResponseDtoDetails
}> = ({ details }) => {
  if (!details || Object.keys(details).length === 0) {
    return null
  }
  // Se details for uma string, apenas a exiba
  if (typeof details === "string") {
    return <p>{details}</p>
  }
  // Se for um objeto, transforme em lista
  return (
    <ul className="list-disc pl-5 text-xs">
      {Object.entries(details).map(([key, value]) => (
        <li key={key}>
          <strong>{key}:</strong> {String(value)}
        </li>
      ))}
    </ul>
  )
}

/**
 * Página de teste para verificar a funcionalidade do grid de alocações
 */
export const TestSchedulePage: React.FC = () => {
  // Hook de mutação para validar alocação
  const validateAlocacaoMutation = useValidateAlocacaoMutation()
  const { isPending: isValidatingAlocacao } = validateAlocacaoMutation

  // Hook para criar alocação
  const createAlocacaoMutation = useCreateAlocacaoMutation()
  const { isPending: isCreatingAlocacao } = createAlocacaoMutation

  // Hook para deletar alocação
  const deleteAlocacaoMutation = useDeleteAlocacaoMutation()
  const { isPending: isDeletingAlocacao } = deleteAlocacaoMutation

  // Dados de teste - configuração de horário
  const mockConfiguracaoHorario: ConfiguracaoHorarioDto = {
    id: "test-config",
    duracaoAulaMinutos: 50,
    numeroAulasPorTurno: 4,
    inicioTurnoManha: "07:30",
    fimTurnoManhaCalculado: "11:10",
    inicioTurnoTarde: "13:30",
    fimTurnoTardeCalculado: "17:10",
    inicioTurnoNoite: "19:00",
    fimTurnoNoiteCalculado: "22:40",
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    aulasTurnoManha: [
      { inicio: "07:30", fim: "08:20" },
      { inicio: "08:20", fim: "09:10" },
      { inicio: "09:30", fim: "10:20" },
      { inicio: "10:20", fim: "11:10" },
    ],
    aulasTurnoTarde: [
      { inicio: "13:30", fim: "14:20" },
      { inicio: "14:20", fim: "15:10" },
      { inicio: "15:30", fim: "16:20" },
      { inicio: "16:20", fim: "17:10" },
    ],
    aulasTurnoNoite: [
      { inicio: "19:00", fim: "19:50" },
      { inicio: "19:50", fim: "20:40" },
      { inicio: "21:00", fim: "21:50" },
      { inicio: "21:50", fim: "22:40" },
    ],
  }

  // Estado para alocações de teste
  const [alocacoes, setAlocacoes] = useState<AlocacaoHorarioResponseDto[]>([
    {
      id: "aloc-1",
      idTurma: "turma-1",
      diaDaSemana: "SEGUNDA" as AlocacaoHorarioResponseDtoDiaDaSemana,
      horaInicio: "07:30",
      horaFim: "08:20",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      turma: {
        id: "turma-1",
        codigoDaTurma: "ADS-2024-1",
        disciplinaOfertada: {
          id: "disc-1",
          disciplina: {
            id: "disciplina-1",
            nome: "Programação Web",
            codigo: "PW001",
            cargaHoraria: 80,
          },
        },
        professorAlocado: {
          id: "prof-1",
          nome: "Prof. João Silva",
          email: "joao.silva@email.com",
        },
      },
    },
    {
      id: "aloc-2",
      idTurma: "turma-2",
      diaDaSemana: "SEGUNDA" as AlocacaoHorarioResponseDtoDiaDaSemana,
      horaInicio: "07:30",
      horaFim: "08:20",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      turma: {
        id: "turma-2",
        codigoDaTurma: "ADS-2024-2",
        disciplinaOfertada: {
          id: "disc-2",
          disciplina: {
            id: "disciplina-2",
            nome: "Banco de Dados",
            codigo: "BD001",
            cargaHoraria: 80,
          },
        },
        professorAlocado: {
          id: "prof-1", // Mesmo professor - vai gerar conflito
          nome: "Prof. João Silva",
          email: "joao.silva@email.com",
        },
      },
    },
    {
      id: "aloc-3",
      idTurma: "turma-3",
      diaDaSemana: "TERCA" as AlocacaoHorarioResponseDtoDiaDaSemana,
      horaInicio: "13:30",
      horaFim: "14:20",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      turma: {
        id: "turma-3",
        codigoDaTurma: "ADS-2024-3",
        disciplinaOfertada: {
          id: "disc-3",
          disciplina: {
            id: "disciplina-3",
            nome: "Estrutura de Dados",
            codigo: "ED001",
            cargaHoraria: 80,
          },
        },
        professorAlocado: {
          id: "prof-2",
          nome: "Prof. Maria Santos",
          email: "maria.santos@email.com",
        },
      },
    },
  ])

  // Estado para slot selecionado
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string
    startTime: string
    endTime: string
    turno: string
  } | null>(null)

  // Estado para alocação selecionada
  const [selectedAlocacao, setSelectedAlocacao] =
    useState<AlocacaoHorarioResponseDto | null>(null)

  // Novo estado para o slot que causou erro de validação
  const [errorSlot, setErrorSlot] = useState<{
    day: string
    startTime: string
    endTime: string
  } | null>(null)

  // Estado para controlar o diálogo de confirmação de deleção
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  // Hook de conflitos
  const { conflicts, stats, hasCriticalConflicts } = useConflicts({
    alocacoes,
    enabled: true,
  })

  // Handlers
  const handleSlotClick = (slotInfo: {
    day: string
    startTime: string
    endTime: string
    turno: "manha" | "tarde" | "noite"
  }) => {
    setSelectedSlot(slotInfo)
    setSelectedAlocacao(null)
  }

  const handleAlocacaoClick = (alocacao: AlocacaoHorarioResponseDto) => {
    setSelectedAlocacao(alocacao)
    setSelectedSlot(null)
  }

  // Função para adicionar alocação de teste
  const addTestAlocacao = async () => {
    if (!selectedSlot) return

    const diaDaSemanaFormatado = selectedSlot.day
      .toUpperCase()
      .replace("Ç", "C") as AlocacaoHorarioResponseDtoDiaDaSemana

    const validateDto: ValidateAlocacaoDto = {
      idTurma: "turma-mock-para-teste-fluxo",
      diaDaSemana: diaDaSemanaFormatado,
      horaInicio: selectedSlot.startTime,
      horaFim: selectedSlot.endTime,
    }

    try {
      const validationResult = await validateAlocacaoMutation.mutateAsync({
        data: validateDto,
      })

      if (!validationResult.valid) {
        toast.error(
          `Conflito ao validar: ${validationResult.error || "Erro desconhecido"}`,
          {
            description:
              validationResult.details ?
                <ValidationDetailsList details={validationResult.details} />
              : undefined,
          },
        )
        if (selectedSlot) {
          setErrorSlot({
            day: selectedSlot.day,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          })
          setTimeout(() => setErrorSlot(null), 3000)
        }
        return
      }

      // Validação passou, agora tenta criar a alocação
      const createDto: CreateAlocacaoHorarioDto = {
        idTurma: "turma-mock-para-teste-fluxo",
        diaDaSemana: diaDaSemanaFormatado,
        horaInicio: selectedSlot.startTime,
        horaFim: selectedSlot.endTime,
      }

      await createAlocacaoMutation.mutateAsync(
        { data: createDto },
        {
          onSuccess: (novaAlocacao) => {
            setAlocacoes((prev) => [...prev, novaAlocacao])
            toast.success("Alocação criada com sucesso pela API!")
            setSelectedSlot(null)
          },
          onError: (error) => {
            console.error("Erro ao criar alocação via API:", error)
            const errorMsg =
              error instanceof Error ? error.message : "Erro desconhecido"
            toast.error(`Falha ao criar alocação: ${errorMsg}`)
            if (selectedSlot) {
              setErrorSlot({
                day: selectedSlot.day,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
              })
              setTimeout(() => setErrorSlot(null), 3000)
            }
          },
        },
      )
    } catch (error) {
      console.error("Erro no fluxo de adicionar alocação:", error)
      if (!(error instanceof Error && error.message.includes("mutateAsync"))) {
        toast.error(
          "Erro inesperado ao processar a alocação. Verifique o console.",
        )
      }
      if (selectedSlot && !errorSlot) {
        setErrorSlot({
          day: selectedSlot.day,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        })
        setTimeout(() => setErrorSlot(null), 3000)
      }
    }
  }

  const handleAttemptRemoveAlocacao = () => {
    if (!selectedAlocacao) return
    setIsConfirmDeleteOpen(true)
  }

  const executeRemoveAlocacao = async () => {
    if (!selectedAlocacao) return

    try {
      await deleteAlocacaoMutation.mutateAsync({ id: selectedAlocacao.id })
      setAlocacoes((prev) => prev.filter((a) => a.id !== selectedAlocacao.id))
      toast.success("Alocação removida com sucesso!")
      setSelectedAlocacao(null)
    } catch (error) {
      console.error("Erro ao remover alocação:", error)
      const errorMsg =
        error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Falha ao remover alocação: ${errorMsg}`)
    }
    setIsConfirmDeleteOpen(false)
  }

  // Função para limpar todas as alocações
  const clearAllAlocacoes = () => {
    setAlocacoes([])
    setSelectedSlot(null)
    setSelectedAlocacao(null)
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teste - Grid de Alocações</h1>
        <div className="flex items-center gap-2">
          {hasCriticalConflicts && (
            <Badge variant="destructive">Conflitos Críticos!</Badge>
          )}
          <ConflictIndicator conflicts={conflicts} />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Alocações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alocacoes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conflitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {stats.critical}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Auto-resolvíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.autoResolvable}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={addTestAlocacao}
              disabled={
                !selectedSlot || isValidatingAlocacao || isCreatingAlocacao
              }
              variant="default"
            >
              {isValidatingAlocacao || isCreatingAlocacao ?
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : null}
              Adicionar Alocação no Slot Selecionado
            </Button>
            <Button
              onClick={handleAttemptRemoveAlocacao}
              disabled={!selectedAlocacao || isDeletingAlocacao}
              variant="destructive"
            >
              {isDeletingAlocacao && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remover Alocação Selecionada
            </Button>
            <Button
              onClick={clearAllAlocacoes}
              variant="outline"
            >
              Limpar Todas
            </Button>
          </div>

          {selectedSlot && (
            <div className="rounded-lg bg-blue-50 p-3">
              <strong>Slot Selecionado:</strong> {selectedSlot.day} -{" "}
              {selectedSlot.startTime} às {selectedSlot.endTime} (
              {selectedSlot.turno})
            </div>
          )}

          {selectedAlocacao && (
            <div className="rounded-lg bg-green-50 p-3">
              <strong>Alocação Selecionada:</strong>{" "}
              {selectedAlocacao.turma.codigoDaTurma} -{" "}
              {selectedAlocacao.turma.disciplinaOfertada.disciplina.nome}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Horários */}
      <Card>
        <CardHeader>
          <CardTitle>Grid de Alocações</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleGrid
            configuracaoHorario={mockConfiguracaoHorario}
            alocacoes={alocacoes}
            onSlotClick={handleSlotClick}
            onAlocacaoClick={handleAlocacaoClick}
            errorSlot={errorSlot}
          />
        </CardContent>
      </Card>

      {/* Lista de Conflitos */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conflitos Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <ConflictList
              conflicts={conflicts}
              onConflictSelect={(conflict) =>
                console.log("Conflito selecionado:", conflict)
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug - Dados Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-60 overflow-auto rounded bg-gray-100 p-4 text-xs">
            {JSON.stringify(
              {
                alocacoes: alocacoes.length,
                conflicts: conflicts.length,
                selectedSlot,
                selectedAlocacao: selectedAlocacao?.id,
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>

      {/* AlertDialog para confirmação de deleção */}
      <AlertDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a alocação para "
              {selectedAlocacao?.turma.disciplinaOfertada.disciplina.nome} (Turma:{" "}
              {selectedAlocacao?.turma.codigoDaTurma})"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAlocacao}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeRemoveAlocacao}
              disabled={isDeletingAlocacao}
            >
              {isDeletingAlocacao && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TestSchedulePage
