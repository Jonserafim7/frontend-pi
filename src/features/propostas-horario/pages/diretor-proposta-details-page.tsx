import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarCheck, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams, useNavigate } from "react-router"

/**
 * Página de detalhes de uma proposta de horário para diretores
 * Permite visualizar propostas e executar ações de aprovação/rejeição
 */
export function DiretorPropostaDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate("/diretor/propostas-horario")
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
          <HeaderIconContainer Icon={CalendarCheck} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Análise de Proposta</h1>
            <p className="text-muted-foreground">ID: {id}</p>
          </div>
        </div>

        {/* TODO: Mostrar botões apenas para propostas PENDENTE */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-green-600 text-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprovar
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
        </div>
      </div>

      {/* TODO: Implementar informações da proposta */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-4 font-semibold">Informações da Proposta</h3>
        <div className="text-muted-foreground">
          <p>
            Coordenador, curso, período, status, observações serão exibidos aqui
          </p>
        </div>
      </div>

      {/* TODO: Implementar ScheduleGrid read-only */}
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        <CalendarCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Grade de horários (visualização) será implementada aqui</p>
      </div>
    </div>
  )
}
