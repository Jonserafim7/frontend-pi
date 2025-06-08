import { CalendarCheck } from "lucide-react"
import { toast } from "sonner"

import { HeaderIconContainer } from "@/components/icon-container"
import { DataTable } from "@/components/data-table/data-table"
import { usePropostasHorarioControllerFindAll } from "@/api-generated/client/propostas-horario/propostas-horario"

import { propostasDirectorColumns } from "../components/data-table/propostas-columns"
import { DiretorPropostasFilters } from "../components/data-table/diretor-propostas-filters"

/**
 * Página de listagem de propostas de horário para diretores
 * Exibe todas as propostas do sistema com filtros e ações de aprovação
 */
export function DiretorPropostasListPage() {
  const {
    data: propostas = [],
    isLoading,
    error,
  } = usePropostasHorarioControllerFindAll()

  if (error) {
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

        <div className="flex items-center justify-center rounded-lg border p-8 text-center">
          <div className="text-muted-foreground">
            <CalendarCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Erro ao carregar as propostas de horário</p>
            <p className="mt-2 text-sm">
              Tente recarregar a página ou contate o suporte
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarCheck} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Propostas de Horário</h1>
            <p className="text-muted-foreground">
              Analise e aprove propostas de grade horária de todos os cursos
            </p>
          </div>
        </div>
      </div>

      {isLoading ?
        <div className="flex items-center justify-center rounded-lg border p-8 text-center">
          <div className="text-muted-foreground">
            <CalendarCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Carregando propostas de horário...</p>
          </div>
        </div>
      : <DataTable
          data={propostas}
          columns={propostasDirectorColumns}
          filters={(table) => <DiretorPropostasFilters table={table} />}
          header={(table) => (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-muted-foreground text-sm">
                  {table.getFilteredRowModel().rows.length} de{" "}
                  {table.getCoreRowModel().rows.length} proposta(s)
                </p>
              </div>
            </div>
          )}
        />
      }
    </div>
  )
}
