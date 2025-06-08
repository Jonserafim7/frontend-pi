import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarCheck } from "lucide-react"

/**
 * Página de listagem de propostas de horário para diretores
 * Exibe todas as propostas do sistema com filtros e ações de aprovação
 */
export function DiretorPropostasListPage() {
  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={CalendarCheck} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Propostas de Horário</h1>
          <p className="text-muted-foreground">
            Analise e aprove propostas de grade horária
          </p>
        </div>
      </div>

      {/* TODO: Implementar PropostasDataTable para diretores */}
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        <CalendarCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Lista de propostas para aprovação será implementada aqui</p>
        <p className="mt-2 text-sm">
          (Incluirá filtros por curso, coordenador e status)
        </p>
      </div>
    </div>
  )
}
