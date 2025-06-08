import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarDays, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams, useNavigate } from "react-router"

/**
 * Página de detalhes/edição de uma proposta de horário
 * Permite visualizar e editar propostas baseado no status
 */
export function PropostaDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate("/coordenador/propostas-horario")
  }

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Detalhes da Proposta</h1>
            <p className="text-muted-foreground">ID: {id}</p>
          </div>
        </div>
      </div>

      {/* TODO: Implementar informações da proposta */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-4 font-semibold">Informações da Proposta</h3>
        <div className="text-muted-foreground">
          <p>Curso, período, status, datas serão exibidos aqui</p>
        </div>
      </div>

      {/* TODO: Implementar ScheduleGrid adaptado */}
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Grade de horários será implementada aqui</p>
      </div>
    </div>
  )
}
