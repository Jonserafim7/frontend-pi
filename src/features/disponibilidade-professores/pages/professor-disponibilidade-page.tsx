import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { Plus, Calendar, Clock } from "lucide-react"
import {
  DisponibilidadeForm,
  DisponibilidadeList,
  DisponibilidadesDataTable,
} from "../components"
import type { DisponibilidadeTableData } from "../components"
import {
  useCreateDisponibilidade,
  useUpdateDisponibilidade,
  useDeleteDisponibilidade,
  useDisponibilidades,
} from "../hooks/use-disponibilidades"
import type {
  CreateDisponibilidadeDto,
  UpdateDisponibilidadeDto,
  DisponibilidadeResponseDto,
} from "@/api-generated/model"
import type {
  DiaSemana,
  StatusDisponibilidade,
} from "../schemas/disponibilidade-schemas"

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
 * Função para converter DisponibilidadeResponseDto para DisponibilidadeTableData
 */
function convertToTableData(
  dto: DisponibilidadeResponseDto,
): DisponibilidadeTableData {
  return {
    id: dto.id,
    diaDaSemana: dto.diaDaSemana as DiaSemana,
    horaInicio: dto.horaInicio,
    horaFim: dto.horaFim,
    status: dto.status as StatusDisponibilidade,
    professor: {
      id: dto.usuarioProfessor.id,
      nome: dto.usuarioProfessor.nome,
    },
    periodoLetivo: {
      id: dto.periodoLetivo.id,
      nome: `${dto.periodoLetivo.ano}.${dto.periodoLetivo.semestre}`,
    },
    dataCriacao: new Date(dto.dataCriacao),
    dataAtualizacao: new Date(dto.dataAtualizacao),
  }
}

/**
 * Página principal de disponibilidade do professor
 */
export function ProfessorDisponibilidadePage() {
  // Estados do modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedDisponibilidade, setSelectedDisponibilidade] =
    useState<DisponibilidadeTableData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Estado da visualização
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  // Mock data - substituir por dados reais
  const currentProfessor: Professor = {
    id: "prof-123",
    nome: "Dr. João Silva",
    email: "joao.silva@universidade.edu.br",
  }

  const currentPeriodo: PeriodoLetivo = {
    id: "periodo-2024-1",
    nome: "2024.1",
    ativo: true,
  }

  // Hooks para operações
  const { data: disponibilidades, isLoading } = useDisponibilidades({
    professorId: currentProfessor.id,
    periodoLetivoId: currentPeriodo.id,
  })
  const createMutation = useCreateDisponibilidade()
  const updateMutation = useUpdateDisponibilidade()
  const deleteMutation = useDeleteDisponibilidade()

  // Converter dados para o formato da tabela
  const disponibilidadesList =
    disponibilidades?.data ? disponibilidades.data.map(convertToTableData) : []

  // Handlers
  const handleCreate = () => {
    setShowCreateModal(true)
  }

  const handleEdit = (disponibilidade: DisponibilidadeTableData) => {
    setSelectedDisponibilidade(disponibilidade)
    setShowEditModal(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const handleCreateSubmit = (
    data: CreateDisponibilidadeDto | UpdateDisponibilidadeDto,
  ) => {
    // Garantir que seja CreateDisponibilidadeDto para criação
    const createData = data as CreateDisponibilidadeDto
    createMutation.mutate(
      { data: createData },
      {
        onSuccess: () => {
          setShowCreateModal(false)
          toast.success("Disponibilidade criada com sucesso!")
        },
        onError: () => {
          toast.error("Erro ao criar disponibilidade. Tente novamente.")
        },
      },
    )
  }

  const handleEditSubmit = (
    data: CreateDisponibilidadeDto | UpdateDisponibilidadeDto,
  ) => {
    if (!selectedDisponibilidade) return

    // Garantir que seja UpdateDisponibilidadeDto para edição
    const updateData = data as UpdateDisponibilidadeDto
    updateMutation.mutate(
      { id: selectedDisponibilidade.id, data: updateData },
      {
        onSuccess: () => {
          setShowEditModal(false)
          setSelectedDisponibilidade(null)
          toast.success("Disponibilidade atualizada com sucesso!")
        },
        onError: () => {
          toast.error("Erro ao atualizar disponibilidade. Tente novamente.")
        },
      },
    )
  }

  const confirmDelete = () => {
    if (!deleteId) return

    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setDeleteId(null)
          toast.success("Disponibilidade excluída com sucesso!")
        },
        onError: () => {
          toast.error("Erro ao excluir disponibilidade. Tente novamente.")
        },
      },
    )
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedDisponibilidade(null)
  }

  // Loading states
  const loadingStates: Record<string, boolean> = {}
  if (deleteMutation.isPending && deleteId) {
    loadingStates[deleteId] = true
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Minhas Disponibilidades
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus horários de disponibilidade para o período{" "}
              <span className="font-semibold">{currentPeriodo.nome}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setViewMode(viewMode === "cards" ? "table" : "cards")
              }
            >
              {viewMode === "cards" ?
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Tabela
                </>
              : <>
                  <Clock className="mr-2 h-4 w-4" />
                  Cards
                </>
              }
            </Button>

            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Disponibilidade
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Disponibilidades
              </p>
              <p className="text-2xl font-bold text-green-600">
                {disponibilidadesList.filter(
                  (d: DisponibilidadeTableData) => d.status === "DISPONIVEL",
                ).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Indisponibilidades
              </p>
              <p className="text-2xl font-bold text-red-600">
                {disponibilidadesList.filter(
                  (d: DisponibilidadeTableData) => d.status === "INDISPONIVEL",
                ).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total de Horários
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {disponibilidadesList.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-6">
        {viewMode === "cards" ?
          <DisponibilidadeList
            disponibilidades={disponibilidadesList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            isLoading={isLoading}
            loadingStates={loadingStates}
            title="Suas Disponibilidades"
            description="Visualize e gerencie seus horários de disponibilidade"
            showCreateButton={true}
          />
        : <DisponibilidadesDataTable
            data={disponibilidadesList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            isLoading={isLoading}
            title="Suas Disponibilidades"
          />
        }
      </div>

      {/* Modal de Criação */}
      <Dialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Disponibilidade</DialogTitle>
            <DialogDescription>
              Informe um novo horário de disponibilidade para o período{" "}
              {currentPeriodo.nome}.
            </DialogDescription>
          </DialogHeader>
          <DisponibilidadeForm
            mode="create"
            professorId={currentProfessor.id}
            periodoLetivoId={currentPeriodo.id}
            onSubmit={handleCreateSubmit}
            onCancel={closeCreateModal}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Disponibilidade</DialogTitle>
            <DialogDescription>
              Altere os dados da sua disponibilidade conforme necessário.
            </DialogDescription>
          </DialogHeader>
          {selectedDisponibilidade && (
            <DisponibilidadeForm
              mode="edit"
              initialData={selectedDisponibilidade}
              onSubmit={handleEditSubmit}
              onCancel={closeEditModal}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  )
}
