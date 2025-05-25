import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, X, Loader2, Sun, Sunset, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

import {
  useDisponibilidadeProfessorControllerCreate,
  useDisponibilidadeProfessorControllerUpdate,
  useDisponibilidadeProfessorControllerRemove,
  getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey,
} from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { CreateDisponibilidadeDtoDiaDaSemana } from "@/api-generated/model/create-disponibilidade-dto-dia-da-semana"
import { CreateDisponibilidadeDtoStatus } from "@/api-generated/model/create-disponibilidade-dto-status"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import type { TurnoType, TurnoData } from "../../hooks/use-configuracoes-horario"

// Tipos
interface SlotData {
  diaDaSemana: string
  horaInicio: string
  horaFim: string
  disponibilidade?: DisponibilidadeResponseDto | null
  isValidSlot: boolean
}

interface TimeSlotGroup {
  horario: string
  inicio: string
  fim: string
  slots: (SlotData | undefined)[]
}

interface GridTurnoProps {
  turno: TurnoType
  turnoData: TurnoData
  professorId: string
  periodoId: string
  disponibilidades?: DisponibilidadeResponseDto[]
  isLoading?: boolean
  readonly?: boolean
}

// Constantes
const DIAS_SEMANA = [
  { key: "SEGUNDA", label: "SEG", fullLabel: "Segunda-feira" },
  { key: "TERCA", label: "TER", fullLabel: "Terça-feira" },
  { key: "QUARTA", label: "QUA", fullLabel: "Quarta-feira" },
  { key: "QUINTA", label: "QUI", fullLabel: "Quinta-feira" },
  { key: "SEXTA", label: "SEX", fullLabel: "Sexta-feira" },
  { key: "SABADO", label: "SAB", fullLabel: "Sábado" },
]

// Função utilitária para converter horário em minutos
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// Ícones por turno
const getTurnoIcon = (turno: TurnoType) => {
  switch (turno) {
    case "manha":
      return Sun
    case "tarde":
      return Sunset
    case "noite":
      return Moon
    default:
      return Clock
  }
}

// Cores por turno
const getTurnoColor = (turno: TurnoType) => {
  switch (turno) {
    case "manha":
      return "text-amber-500"
    case "tarde":
      return "text-orange-500"
    case "noite":
      return "text-indigo-500"
    default:
      return "text-gray-500"
  }
}

// Componente de célula individual
interface SlotCellProps {
  slot: SlotData
  onSlotClick: (slot: SlotData) => void
  isLoading?: boolean
  readonly?: boolean
}

const SlotCell: React.FC<SlotCellProps> = ({
  slot,
  onSlotClick,
  isLoading = false,
  readonly = false,
}) => {
  if (!slot.isValidSlot) {
    return (
      <div className="bg-accent dark:bg-accent/50 dark:border-accent h-12 w-full rounded-md border border-dashed" />
    )
  }

  const getSlotStyles = () => {
    if (!slot.disponibilidade) {
      return "border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
    }

    if (slot.disponibilidade.status === "DISPONIVEL") {
      return "border-green-500 bg-green-100 hover:bg-green-200 text-green-700 dark:border-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300"
    }

    return "border-red-500 bg-red-100 hover:bg-red-200 text-red-700 dark:border-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300"
  }

  const getSlotIcon = () => {
    if (!slot.disponibilidade) return null

    if (slot.disponibilidade.status === "DISPONIVEL") {
      return <CheckCircle className="h-4 w-4" />
    }

    return <X className="h-4 w-4" />
  }

  const getSlotLabel = () => {
    if (!slot.disponibilidade) return ""

    if (slot.disponibilidade.status === "DISPONIVEL") return "Disp."

    return "Indisp."
  }

  return (
    <button
      className={cn(
        "flex h-12 w-full items-center justify-center gap-1 rounded-md border-2 text-xs font-medium transition-all duration-200",
        getSlotStyles(),
        isLoading && "cursor-not-allowed opacity-50",
        readonly && "cursor-default hover:bg-current",
      )}
      onClick={() => !isLoading && !readonly && onSlotClick(slot)}
      disabled={isLoading || readonly}
      title={`${slot.diaDaSemana} ${slot.horaInicio}-${slot.horaFim}${slot.disponibilidade ? ` (${slot.disponibilidade.status})` : " (Clique para definir)"}`}
    >
      {isLoading ?
        <Loader2 className="h-3 w-3 animate-spin" />
      : <>
          {getSlotIcon()}
          <span className="hidden sm:inline">{getSlotLabel()}</span>
        </>
      }
    </button>
  )
}

// Componente principal
export const GridTurno: React.FC<GridTurnoProps> = ({
  turno,
  turnoData,
  professorId,
  periodoId,
  disponibilidades = [],
  isLoading = false,
  readonly = false,
}) => {
  const [loadingSlots, setLoadingSlots] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Mutations
  const { mutate: createDisponibilidade } =
    useDisponibilidadeProfessorControllerCreate()
  const { mutate: updateDisponibilidade } =
    useDisponibilidadeProfessorControllerUpdate()
  const { mutate: removeDisponibilidade } =
    useDisponibilidadeProfessorControllerRemove()

  // Processar dados para formar grid do turno
  const gridData = useMemo(() => {
    console.group(`🔍 DEBUG GRID TURNO ${turno.toUpperCase()}`)
    console.log("📊 turnoData recebido:", turnoData)
    console.log("📋 disponibilidades recebidas:", disponibilidades)

    if (!turnoData?.aulas?.length) {
      console.log("⚠️ turnoData.aulas está vazio ou undefined")
      console.groupEnd()
      return []
    }

    const slots = turnoData.aulas
    const grid: SlotData[] = []

    console.log("🔍 Processando slots do turno:", slots)

    DIAS_SEMANA.forEach((dia) => {
      slots.forEach((slot) => {
        const slotKey = `${dia.key}-${slot.inicio}-${slot.fim}`

        // Encontrar disponibilidade existente
        const disponibilidade = disponibilidades.find((d) => {
          if (d.diaDaSemana !== dia.key) return false

          // Converter horários para minutos para comparação
          const slotInicioMin = timeToMinutes(slot.inicio)
          const slotFimMin = timeToMinutes(slot.fim)
          const dispInicioMin = timeToMinutes(d.horaInicio)
          const dispFimMin = timeToMinutes(d.horaFim)

          // Verifica se a disponibilidade contém completamente o slot
          // ou se há alguma intersecção
          return (
            (dispInicioMin <= slotInicioMin && dispFimMin >= slotFimMin) || // Disponibilidade contém o slot
            (slotInicioMin <= dispInicioMin && slotFimMin >= dispFimMin) || // Slot contém a disponibilidade
            (dispInicioMin < slotFimMin && dispFimMin > slotInicioMin) // Há intersecção
          )
        })

        if (disponibilidade) {
          console.log(
            `✅ Disponibilidade encontrada para ${slotKey}:`,
            disponibilidade,
          )
        }

        grid.push({
          diaDaSemana: dia.key,
          horaInicio: slot.inicio,
          horaFim: slot.fim,
          disponibilidade,
          isValidSlot: true,
        })
      })
    })

    console.log(`🗂️ gridData processado para turno ${turno}:`, grid)
    console.groupEnd()
    return grid
  }, [turnoData, disponibilidades, turno])

  // Agrupar por horário para as linhas
  const slotsByTime = useMemo((): TimeSlotGroup[] => {
    if (!turnoData?.aulas?.length) return []

    const result = turnoData.aulas.map(
      (slot): TimeSlotGroup => ({
        horario: `${slot.inicio} - ${slot.fim}`,
        inicio: slot.inicio,
        fim: slot.fim,
        slots: DIAS_SEMANA.map((dia) =>
          gridData.find(
            (s) => s.diaDaSemana === dia.key && s.horaInicio === slot.inicio,
          ),
        ),
      }),
    )

    console.log(`⏰ slotsByTime processado para turno ${turno}:`, result)
    return result
  }, [gridData, turnoData, turno])

  // Handler para click em slot
  const handleSlotClick = async (slot: SlotData) => {
    console.group(`👆 SLOT CLICK DEBUG - TURNO ${turno.toUpperCase()}`)
    console.log("Slot clicado:", slot)

    if (readonly) {
      console.log("⚠️ Modo readonly ativo, operação cancelada")
      console.groupEnd()
      return
    }

    const slotKey = `${slot.diaDaSemana}-${slot.horaInicio}-${slot.horaFim}`
    console.log("🔑 Slot key gerada:", slotKey)
    setLoadingSlots((prev) => new Set(prev).add(slotKey))

    try {
      if (!slot.disponibilidade) {
        const payload = {
          data: {
            diaDaSemana: slot.diaDaSemana as CreateDisponibilidadeDtoDiaDaSemana,
            horaInicio: slot.horaInicio,
            horaFim: slot.horaFim,
            status: CreateDisponibilidadeDtoStatus.DISPONIVEL,
            idUsuarioProfessor: professorId,
            idPeriodoLetivo: periodoId,
          },
        }

        console.log("📤 Payload que será enviado para CREATE:", payload)

        // Criar nova disponibilidade (padrão: DISPONIVEL)
        await new Promise<void>((resolve, reject) => {
          createDisponibilidade(payload, {
            onSuccess: async (response) => {
              console.log("✅ CREATE SUCCESS:", response)
              toast({
                variant: "default",
                title: "Disponibilidade criada",
                description: `Horário ${slot.horaInicio}-${slot.horaFim} marcado como disponível`,
              })

              // Invalidar queries imediatamente após sucesso
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey:
                    getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey(
                      professorId,
                      periodoId,
                    ),
                }),
                queryClient.invalidateQueries({
                  queryKey: ["disponibilidades", professorId, periodoId],
                }),
                queryClient.invalidateQueries({
                  queryKey: ["disponibilidades"],
                }),
              ])

              resolve()
            },
            onError: (error: any) => {
              console.error("❌ CREATE ERROR:", error)
              console.error("Error response:", error.response?.data)
              console.error("Error status:", error.response?.status)
              toast({
                title: "Erro ao criar disponibilidade",
                description: error?.message || "Ocorreu um erro inesperado",
                variant: "destructive",
              })
              reject(error)
            },
          })
        })
      } else if (slot.disponibilidade.status === "DISPONIVEL") {
        const payload = {
          id: slot.disponibilidade!.id,
          data: {
            status: CreateDisponibilidadeDtoStatus.INDISPONIVEL,
          },
        }

        console.log(
          "📤 Payload que será enviado para UPDATE (DISPONIVEL→INDISPONIVEL):",
          payload,
        )

        // Mudar para INDISPONIVEL
        await new Promise<void>((resolve, reject) => {
          updateDisponibilidade(payload, {
            onSuccess: async (response) => {
              console.log("✅ UPDATE SUCCESS:", response)
              toast({
                variant: "default",
                title: "Disponibilidade atualizada",
                description: `Horário ${slot.horaInicio}-${slot.horaFim} marcado como indisponível`,
              })

              // Invalidar queries imediatamente após sucesso
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey:
                    getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey(
                      professorId,
                      periodoId,
                    ),
                }),
                queryClient.invalidateQueries({
                  queryKey: ["disponibilidades", professorId, periodoId],
                }),
                queryClient.invalidateQueries({
                  queryKey: ["disponibilidades"],
                }),
              ])

              resolve()
            },
            onError: (error: any) => {
              console.error("❌ UPDATE ERROR:", error)
              console.error("Error response:", error.response?.data)
              toast({
                title: "Erro ao atualizar disponibilidade",
                description: error?.message || "Ocorreu um erro inesperado",
                variant: "destructive",
              })
              reject(error)
            },
          })
        })
      } else {
        const payload = { id: slot.disponibilidade!.id }
        console.log("📤 Payload que será enviado para DELETE:", payload)

        // Remover disponibilidade
        await new Promise<void>((resolve, reject) => {
          removeDisponibilidade(payload, {
            onSuccess: async (response) => {
              console.log("✅ DELETE SUCCESS:", response)
              toast({
                variant: "default",
                title: "Disponibilidade removida",
                description: `Horário ${slot.horaInicio}-${slot.horaFim} removido`,
              })

              // Invalidar queries imediatamente após sucesso
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey:
                    getDisponibilidadeProfessorControllerFindByProfessorAndPeriodoQueryKey(
                      professorId,
                      periodoId,
                    ),
                }),
                queryClient.invalidateQueries({
                  queryKey: ["disponibilidades", professorId, periodoId],
                }),
                queryClient.invalidateQueries({
                  queryKey: ["disponibilidades"],
                }),
              ])

              resolve()
            },
            onError: (error: any) => {
              console.error("❌ DELETE ERROR:", error)
              console.error("Error response:", error.response?.data)
              toast({
                title: "Erro ao remover disponibilidade",
                description: error?.message || "Ocorreu um erro inesperado",
                variant: "destructive",
              })
              reject(error)
            },
          })
        })
      }

      console.log("✅ Operação concluída com sucesso")
    } catch (error) {
      console.error("💥 Erro na operação:", error)
    } finally {
      setLoadingSlots((prev) => {
        const newSet = new Set(prev)
        newSet.delete(slotKey)
        return newSet
      })
      console.groupEnd()
    }
  }

  const TurnoIcon = getTurnoIcon(turno)
  const turnoColorClass = getTurnoColor(turno)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TurnoIcon className={cn("h-5 w-5", turnoColorClass)} />
            Turno da {turnoData.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
              <p className="text-muted-foreground text-sm">Carregando...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!turnoData?.aulas?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TurnoIcon className={cn("h-5 w-5", turnoColorClass)} />
            Turno da {turnoData.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <Clock className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <h3 className="mb-1 text-sm font-medium">
              Nenhum horário configurado
            </h3>
            <p className="text-muted-foreground text-xs">
              Os horários do turno da {turnoData.titulo.toLowerCase()} ainda não
              foram configurados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TurnoIcon className={cn("h-5 w-5", turnoColorClass)} />
            Turno da {turnoData.titulo}
            <Badge
              variant="outline"
              className="ml-2 text-xs"
            >
              {turnoData.inicioTurno} - {turnoData.fimTurno}
            </Badge>
          </CardTitle>
          {!readonly && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>Clique para alternar:</span>
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  Vazio
                </Badge>
                <span>→</span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 dark:border-green-400 dark:bg-green-900/30 dark:text-green-300"
                >
                  Disponível
                </Badge>
                <span>→</span>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-700 dark:border-red-400 dark:bg-red-900/30 dark:text-red-300"
                >
                  Indisponível
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header com dias da semana */}
            <div className="mb-3 grid grid-cols-8 gap-2">
              <div className="text-muted-foreground flex h-10 items-center justify-center text-sm font-medium">
                Horário
              </div>
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia.key}
                  className="flex h-10 items-center justify-center text-sm font-medium"
                >
                  <div className="text-center">
                    <div className="font-semibold">{dia.label}</div>
                    <div className="text-muted-foreground hidden text-xs sm:block">
                      {dia.fullLabel.slice(0, 3)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid de slots */}
            <div className="space-y-2">
              {slotsByTime.map((timeSlot: TimeSlotGroup) => (
                <div
                  key={timeSlot.horario}
                  className="grid grid-cols-8 gap-2"
                >
                  <div className="bg-muted/50 dark:bg-muted/30 dark:border-muted flex h-12 items-center justify-center rounded-md border font-mono text-sm">
                    <div className="text-center">
                      <div className="font-medium">{timeSlot.inicio}</div>
                      <div className="text-muted-foreground text-xs">
                        {timeSlot.fim}
                      </div>
                    </div>
                  </div>
                  {timeSlot.slots.map(
                    (slot: SlotData | undefined, index: number) => (
                      <SlotCell
                        key={`${slot?.diaDaSemana || DIAS_SEMANA[index].key}-${timeSlot.inicio}`}
                        slot={
                          slot || {
                            diaDaSemana: DIAS_SEMANA[index].key,
                            horaInicio: timeSlot.inicio,
                            horaFim: timeSlot.fim,
                            disponibilidade: null,
                            isValidSlot: false,
                          }
                        }
                        onSlotClick={handleSlotClick}
                        isLoading={loadingSlots.has(
                          `${slot?.diaDaSemana || DIAS_SEMANA[index].key}-${timeSlot.inicio}-${timeSlot.fim}`,
                        )}
                        readonly={readonly}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
