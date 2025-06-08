import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarDays } from "lucide-react"

/**
 * Página para criação de nova proposta de horário
 * Será redirecionada após criação via dialog para página de edição
 */
export function CreatePropostaPage() {
  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={CalendarDays} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Nova Proposta de Horário</h1>
          <p className="text-muted-foreground">
            Crie uma nova proposta de grade horária
          </p>
        </div>
      </div>

      {/* TODO: Implementar formulário de criação */}
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Formulário de criação será implementado aqui</p>
      </div>
    </div>
  )
}
