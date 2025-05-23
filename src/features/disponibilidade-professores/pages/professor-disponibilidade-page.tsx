import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Clock, Calendar, CheckCircle } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { CreateEditDisponibilidadeFormDialog } from "../components/create-edit-disponibilidade-form-dialog"
import { DisponibilidadesDataTable } from "../components/data-table/disponibilidades-data-table"
import { SkeletonTable } from "@/components/skeleton-table"
import { disponibilidadeColumns } from "../components/data-table/disponibilidade-columns"
import {
  useDeleteDisponibilidade,
  useDisponibilidadesByProfessor,
} from "../hooks/use-disponibilidades"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"

/**
 * Interface para dados do professor (mock)
 */
interface Professor {
  id: string
  nome: string
  email: string
}

/**
 * Interface para dados do período letivo (mock)
 */
interface PeriodoLetivo {
  id: string
  nome: string
  ativo: boolean
}

/**
 * Página principal de disponibilidade do professor
 */
export function ProfessorDisponibilidadePage() {
  // Estados do dialog e modal
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedDisponibilidade, setSelectedDisponibilidade] =
    useState<DisponibilidadeResponseDto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Mock data - substituir por dados reais
  const currentProfessor: Professor = {
    id: "19eab2e6-4f8c-482e-aadf-c81a2f6e09d8", // Pedro Professor
    nome: "Pedro Professor",
    email: "professor1@escola.edu",
  }

  const currentPeriodo: PeriodoLetivo = {
    id: "06a6d41c-40d5-42b6-a7f1-5137a4533ea6", // Período 2025.1 ATIVO
    nome: "2025.1",
    ativo: true,
  }

  // Hooks para operações
  const { data: disponibilidades, isLoading } = useDisponibilidadesByProfessor(
    currentProfessor.id,
    { periodoLetivoId: currentPeriodo.id },
  )
  const deleteMutation = useDeleteDisponibilidade()

  // Handlers
  const handleCreate = () => {
    setSelectedDisponibilidade(null)
    setShowDialog(true)
  }

  const handleEdit = (disponibilidade: DisponibilidadeResponseDto) => {
    setSelectedDisponibilidade(disponibilidade)
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!deleteId) return

    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setDeleteId(null)
        },
      },
    )
  }

  // Calcular estatísticas
  const disponibilidadesList = (disponibilidades as any)?.data || []
  const disponiveisCount = disponibilidadesList.filter(
    (d: DisponibilidadeResponseDto) => d.status === "DISPONIVEL",
  ).length
  const indisponiveisCount = disponibilidadesList.filter(
    (d: DisponibilidadeResponseDto) => d.status === "INDISPONIVEL",
  ).length
  const totalCount = disponibilidadesList.length

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
                <span className="font-semibold">{currentPeriodo.nome}</span>
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus />
            Nova Disponibilidade
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium">
                    Disponibilidades
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="text-2xl font-bold text-green-600">
                {disponiveisCount}
              </div>
              <p className="text-muted-foreground text-xs">
                Horários disponíveis para agendamento
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-transparent py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-500/20 p-2">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium">
                    Indisponibilidades
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="text-2xl font-bold text-red-600">
                {indisponiveisCount}
              </div>
              <p className="text-muted-foreground text-xs">
                Horários bloqueados ou indisponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium">
                    Total de Horários
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <p className="text-muted-foreground text-xs">
                Total de horários cadastrados no sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        {isLoading ?
          <SkeletonTable
            columns={disponibilidadeColumns.length}
            rows={5}
          />
        : <DisponibilidadesDataTable
            data={disponibilidadesList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        }
      </div>

      {/* Dialog de Criação/Edição */}
      <CreateEditDisponibilidadeFormDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        disponibilidade={selectedDisponibilidade || undefined}
        professorId={!selectedDisponibilidade ? currentProfessor.id : undefined}
        periodoLetivoId={!selectedDisponibilidade ? currentPeriodo.id : undefined}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta disponibilidade? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
