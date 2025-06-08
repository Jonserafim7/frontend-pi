import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

/**
 * Página de listagem de propostas de horário para coordenadores
 * Exibe as propostas do coordenador logado com filtros e ações
 */
export function PropostasListPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarDays} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Propostas de Horário</h1>
            <p className="text-muted-foreground">
              Gerencie suas propostas de grade horária
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus />
          Nova Proposta
        </Button>
      </div>

      {/* TODO: Implementar PropostasDataTable */}
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Lista de propostas será implementada aqui</p>
      </div>

      {/* TODO: Implementar CreatePropostaDialog */}
      {isCreateDialogOpen && (
        <div className="text-muted-foreground text-center">
          <p>Dialog de criação será implementado aqui</p>
          <Button
            variant="outline"
            onClick={() => setIsCreateDialogOpen(false)}
            className="mt-2"
          >
            Fechar (temporário)
          </Button>
        </div>
      )}
    </div>
  )
}
