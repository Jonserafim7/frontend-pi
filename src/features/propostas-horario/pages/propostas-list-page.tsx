import { useState, useEffect } from "react"
import { HeaderIconContainer } from "@/components/icon-container"
import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import {
  propostasCoordinatorColumns,
  PropostasFilters,
  usePropostasHorarioControllerFindAll,
  CreatePropostaDialog,
} from "../index"
import { toast } from "sonner"

/**
 * Página de listagem de propostas de horário para coordenadores
 * Exibe as propostas do coordenador logado com filtros e ações
 */
export function PropostasListPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Buscar propostas do coordenador logado
  const {
    data: propostas = [],
    isLoading,
    error,
  } = usePropostasHorarioControllerFindAll()

  const handleCreateProposta = () => {
    setIsCreateDialogOpen(true)
  }

  // Mostrar erro se houver problema na busca
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar propostas")
    }
  }, [error])

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
        <Button onClick={handleCreateProposta}>
          <Plus />
          Nova Proposta
        </Button>
      </div>

      {/* Data Table com Filtros */}
      <DataTable
        columns={propostasCoordinatorColumns}
        data={propostas}
        filters={(table) => <PropostasFilters table={table} />}
        header={(table) => (
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {isLoading ?
                "Carregando propostas..."
              : `${table.getFilteredRowModel().rows.length} de ${table.getCoreRowModel().rows.length} proposta(s)`
              }
            </div>
            {error && (
              <div className="text-destructive text-sm">
                Erro ao carregar dados
              </div>
            )}
          </div>
        )}
      />

      {/* Dialog de Criação de Proposta */}
      <CreatePropostaDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
