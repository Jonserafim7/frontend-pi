import { ScheduleGrid } from "../components/alocacao-turmas-horarios/schedule-grid"
import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarDays } from "lucide-react"

/**
 * Página principal para montagem de propostas de horário
 * Por enquanto apenas para testar o componente ScheduleGrid
 */
export function PropostasHorarioPage() {
  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      {/* Cabeçalho da página */}
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={CalendarDays} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Propostas de Horário</h1>
          <p className="text-muted-foreground">
            Monte e gerencie propostas de horário para o curso
          </p>
        </div>
      </div>

      {/* Grade de horários */}
      <ScheduleGrid className="w-full" />
    </div>
  )
}
