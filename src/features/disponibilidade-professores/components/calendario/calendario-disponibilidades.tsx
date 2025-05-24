import { useMemo, useState } from "react"
import { Calendar } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"

import {
  localizer,
  calendarMessages,
  calendarDefaults,
} from "@/lib/calendar-config"
import {
  transformDisponibilidadesToEvents,
  transformSlotToFormData,
  validateSlotSelection,
  formatSlotInfo,
  type DisponibilidadeEvent,
  type SlotInfo,
} from "../../utils/calendar-transformers"
import { useSlotsValidos } from "../../hooks/use-slots-validos"
import { useDisponibilidadeProfessorControllerFindByProfessorAndPeriodo } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { useToast } from "@/hooks/use-toast"
// import { CriarDisponibilidadeCalendarioDialog } from "./criar-disponibilidade-calendario-dialog"
// import { EditarDisponibilidadeCalendarioDialog } from "./editar-disponibilidade-calendario-dialog"

interface CalendarioDisponibilidadesProps {
  professorId: string
  periodoId: string
  readonly?: boolean
  className?: string
}

export const CalendarioDisponibilidades = ({
  professorId,
  periodoId,
  readonly = false,
  className = "",
}: CalendarioDisponibilidadesProps) => {
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<DisponibilidadeEvent | null>(
    null,
  )
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { toast } = useToast()

  // Buscar disponibilidades existentes
  const { data: disponibilidades, isLoading: loadingDisponibilidades } =
    useDisponibilidadeProfessorControllerFindByProfessorAndPeriodo(
      professorId,
      periodoId,
      {
        query: {
          enabled: !!professorId && !!periodoId,
        },
      },
    )

  // Buscar slots válidos
  const { data: slotsValidos, isLoading: loadingSlotsValidos } =
    useSlotsValidos(periodoId)

  // Converter disponibilidades para eventos do calendário
  const events = useMemo(() => {
    if (!disponibilidades) return []
    return transformDisponibilidadesToEvents(disponibilidades)
  }, [disponibilidades])

  // Handler para seleção de slot (criar nova disponibilidade)
  const handleSlotSelect = (slotInfo: SlotInfo) => {
    if (readonly) return

    // Validar se o slot está dentro dos horários configurados
    const validation = validateSlotSelection(slotInfo, slotsValidos)

    if (!validation.isValid) {
      toast({
        title: "Slot inválido",
        description: validation.message,
        variant: "destructive",
      })
      return
    }

    setSelectedSlot(slotInfo)
    setShowCreateDialog(true)
  }

  // Handler para seleção de evento (editar disponibilidade existente)
  const handleEventSelect = (event: DisponibilidadeEvent) => {
    if (readonly) return

    setSelectedEvent(event)
    setShowEditDialog(true)
  }

  // Handler para fechar dialogs
  const handleCloseDialogs = () => {
    setSelectedSlot(null)
    setSelectedEvent(null)
    setShowCreateDialog(false)
    setShowEditDialog(false)
  }

  // Handler para sucesso na criação/edição
  const handleSuccess = () => {
    handleCloseDialogs()
    toast({
      title: "Sucesso",
      description: "Disponibilidade atualizada com sucesso!",
    })
  }

  // Loading state
  if (loadingDisponibilidades || loadingSlotsValidos) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Carregando calendário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`calendario-disponibilidades ${className}`}>
      <div className="h-96 w-full md:h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={calendarDefaults.defaultView}
          views={["week", "day"]}
          messages={calendarMessages}
          onSelectSlot={readonly ? undefined : handleSlotSelect}
          onSelectEvent={handleEventSelect}
          selectable={!readonly}
          step={calendarDefaults.step}
          timeslots={calendarDefaults.timeslots}
          min={calendarDefaults.min}
          max={calendarDefaults.max}
          scrollToTime={calendarDefaults.scrollToTime}
          dayLayoutAlgorithm="no-overlap"
          eventPropGetter={(event) => ({
            className: `${event.className || ""} ${
              event.resource?.status === "DISPONIVEL" ?
                "bg-green-500 text-white border-green-600"
              : "bg-red-500 text-white border-red-600"
            }`,
            style: {
              borderRadius: "4px",
              border: "1px solid",
            },
          })}
          slotPropGetter={(date) => {
            // Destacar slots válidos visualmente
            const dayName = [
              "DOMINGO",
              "SEGUNDA",
              "TERCA",
              "QUARTA",
              "QUINTA",
              "SEXTA",
              "SABADO",
            ][date.getDay()]
            const timeStr = date.toTimeString().slice(0, 5)
            const daySlots = slotsValidos?.[dayName] || []

            const isValidTime = daySlots.some(
              (slot: any) => timeStr >= slot.horaInicio && timeStr < slot.horaFim,
            )

            return {
              className: isValidTime ? "slot-valido" : "slot-invalido",
            }
          }}
        />
      </div>

      {/* TODO: Implementar dialogs
      {showCreateDialog && selectedSlot && (
        <CriarDisponibilidadeCalendarioDialog
          slotSelecionado={selectedSlot}
          professorId={professorId}
          periodoId={periodoId}
          open={showCreateDialog}
          onClose={handleCloseDialogs}
          onSuccess={handleSuccess}
        />
      )}

      {showEditDialog && selectedEvent && (
        <EditarDisponibilidadeCalendarioDialog
          disponibilidade={selectedEvent.resource}
          open={showEditDialog}
          onClose={handleCloseDialogs}
          onSuccess={handleSuccess}
        />
      )}
      */}
    </div>
  )
}

// Exportar também como default
export default CalendarioDisponibilidades
