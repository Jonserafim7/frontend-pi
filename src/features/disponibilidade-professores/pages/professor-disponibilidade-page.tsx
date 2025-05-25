import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"
import { ResumoHorariosCards } from "../components/resumo-horarios-cards"
import { HeaderIconContainer } from "@/components/icon-container"
import { CreateDisponibilidadeFormDialog } from "../components/create-disponibilidade-form-dialog"
import { DisponibilidadesDataTable } from "../components/data-table/disponibilidades-data-table"
import { DisponibilidadeGrid } from "../components/grid"
import { SkeletonTable } from "@/components/skeleton-table"
import { disponibilidadeColumns } from "../components/data-table/disponibilidade-columns"
import {
  useDisponibilidadeProfessorControllerFindByProfessor,
  getDisponibilidadeProfessorControllerFindByProfessorQueryKey,
} from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { usePeriodosLetivosControllerFindPeriodoAtivo } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { useSlotsValidos } from "../hooks/use-slots-validos"

/**
 * Página principal de disponibilidade do professor
 */
export function ProfessorDisponibilidadePage() {
  const { user } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const { data: periodoAtivo, isLoading: isLoadingPeriodo } =
    usePeriodosLetivosControllerFindPeriodoAtivo()
  const { data: disponibilidades, isLoading } =
    useDisponibilidadeProfessorControllerFindByProfessor(
      user?.id || "",
      { periodoLetivoId: periodoAtivo?.id || "" },
      {
        query: {
          enabled: !!user?.id && !!periodoAtivo?.id,
          queryKey: getDisponibilidadeProfessorControllerFindByProfessorQueryKey(
            user?.id || "",
          ),
        },
      },
    )

  // Buscar slots válidos
  const { data: slotsValidos } = useSlotsValidos(periodoAtivo?.id)

  if (!user || !user.id) {
    return (
      <div className="container mx-auto p-12">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }

  if (isLoadingPeriodo) {
    return (
      <div className="container mx-auto p-12">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Carregando período letivo...</p>
        </div>
      </div>
    )
  }

  if (!periodoAtivo) {
    return (
      <div className="container mx-auto p-12">
        <div className="flex items-center justify-center text-center">
          <div>
            <h2 className="mb-2 text-xl font-semibold">
              Nenhum Período Letivo Ativo
            </h2>
            <p className="text-muted-foreground">
              Não há período letivo ativo no momento. Entre em contato com a
              coordenação.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const disponiveisCount =
    disponibilidades?.filter(
      (d: DisponibilidadeResponseDto) => d.status === "DISPONIVEL",
    ).length || 0
  const indisponiveisCount =
    disponibilidades?.filter(
      (d: DisponibilidadeResponseDto) => d.status === "INDISPONIVEL",
    ).length || 0
  const totalCount = disponibilidades?.length || 0

  return (
    <>
      <div className="container mx-auto space-y-8 p-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderIconContainer Icon={Clock} />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Minhas Disponibilidades</h1>
              <p className="text-muted-foreground">
                Gerencie seus horários de disponibilidade para o período{" "}
                <span className="font-semibold">
                  {periodoAtivo.ano}.{periodoAtivo.semestre}
                </span>
              </p>
            </div>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus />
            Nova Disponibilidade
          </Button>
        </div>

        {/* Cards de Resumo */}
        <ResumoHorariosCards
          disponiveisCount={disponiveisCount}
          indisponiveisCount={indisponiveisCount}
          totalCount={totalCount}
        />

        {/* Grid de Disponibilidades */}
        <DisponibilidadeGrid
          professorId={user.id}
          periodoId={periodoAtivo.id}
          slotsValidos={slotsValidos}
          disponibilidades={disponibilidades || []}
          isLoading={isLoading}
        />

        {/* Data Table */}
        {isLoading ?
          <SkeletonTable
            columns={disponibilidadeColumns.length}
            rows={5}
          />
        : <DisponibilidadesDataTable
            data={disponibilidades || []}
            onEdit={() => {}}
            onDelete={() => {}}
            isLoading={isLoading}
          />
        }
      </div>

      {/* Dialog de Criação/Edição */}
      <CreateDisponibilidadeFormDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        professorId={user.id}
        periodoLetivoId={periodoAtivo.id}
      />
    </>
  )
}
