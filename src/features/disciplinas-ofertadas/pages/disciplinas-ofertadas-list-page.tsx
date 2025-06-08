import { Button } from "@/components/ui/button"
import { HeaderIconContainer } from "@/components/icon-container"
import { Calendar, Plus } from "lucide-react"
import { DisciplinaOfertadaDataTable } from "../components/data-table/disciplina-ofertada-data-table"
import { useDisciplinasOfertadasControllerFindOfertasDoCoordenador } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import { CreateDisciplinaOfertadaComMatrizDialog } from "../components/create-disciplina-ofertada-com-matriz-dialog"
import { SkeletonTable } from "@/components/skeleton-table"
import { disciplinaOfertadaColumns } from "../components/data-table/disciplina-ofertada-columns"
import { useState } from "react"

/**
 * Página principal de listagem de disciplinas ofertadas
 */
export function DisciplinasOfertadasListPage() {
  // Estados para os diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Busca as disciplinas ofertadas da API - apenas dos cursos que o coordenador coordena
  const { data: disciplinasOfertadas, isLoading } =
    useDisciplinasOfertadasControllerFindOfertasDoCoordenador()

  return (
    <>
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderIconContainer Icon={Calendar} />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Disciplinas Ofertadas</h1>
              <p className="text-muted-foreground">
                Gerencie as ofertas de disciplinas por período letivo. Selecione
                uma matriz curricular para ofertar disciplinas.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus />
            Nova Oferta
          </Button>
        </div>

        {isLoading ?
          <SkeletonTable
            columns={disciplinaOfertadaColumns.length}
            rows={4}
          />
        : <DisciplinaOfertadaDataTable
            data={disciplinasOfertadas || []}
            isLoading={isLoading}
          />
        }
      </div>

      {/* Diálogo de criação com matriz curricular */}
      <CreateDisciplinaOfertadaComMatrizDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
}
