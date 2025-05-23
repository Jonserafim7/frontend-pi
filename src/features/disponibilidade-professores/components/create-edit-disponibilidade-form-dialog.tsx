import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HeaderIconContainer } from "@/components/icon-container"
import { Clock, PenSquare } from "lucide-react"
import { DisponibilidadeForm } from "./disponibilidade-form"
import {
  useCreateDisponibilidade,
  useUpdateDisponibilidade,
} from "../hooks/use-disponibilidades"
import type {
  CreateDisponibilidadeDto,
  UpdateDisponibilidadeDto,
  DisponibilidadeResponseDto,
} from "@/api-generated/model"

interface CreateEditDisponibilidadeFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  disponibilidade?: DisponibilidadeResponseDto
  professorId?: string
  periodoLetivoId?: string
}

/**
 * Dialog para criação e edição de disponibilidades
 */
export function CreateEditDisponibilidadeFormDialog({
  isOpen,
  onOpenChange,
  disponibilidade,
  professorId,
  periodoLetivoId,
}: CreateEditDisponibilidadeFormDialogProps) {
  // Estados - recalcular sempre que disponibilidade mudar
  const isEditMode = !!disponibilidade

  // Hooks para operações
  const createMutation = useCreateDisponibilidade()
  const updateMutation = useUpdateDisponibilidade()

  const isPending = createMutation.isPending || updateMutation.isPending

  // Handlers
  const handleCreateSubmit = (
    data: CreateDisponibilidadeDto | UpdateDisponibilidadeDto,
  ) => {
    const createData = data as CreateDisponibilidadeDto
    createMutation.mutate(
      { data: createData },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  const handleEditSubmit = (
    data: CreateDisponibilidadeDto | UpdateDisponibilidadeDto,
  ) => {
    if (!disponibilidade) return

    const updateData = data as UpdateDisponibilidadeDto
    updateMutation.mutate(
      { id: disponibilidade.id, data: updateData },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8 sm:max-w-[600px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={isEditMode ? PenSquare : Clock} />
          <div>
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Editar Disponibilidade" : "Nova Disponibilidade"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ?
                "Altere os campos desejados e clique em atualizar."
              : "Preencha os dados da sua disponibilidade de horário."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DisponibilidadeForm
          mode={isEditMode ? "edit" : "create"}
          initialData={
            disponibilidade ?
              {
                idUsuarioProfessor: disponibilidade.usuarioProfessor?.id,
                idPeriodoLetivo: disponibilidade.periodoLetivo?.id,
                diaDaSemana: disponibilidade.diaDaSemana,
                horaInicio: disponibilidade.horaInicio,
                horaFim: disponibilidade.horaFim,
                status: disponibilidade.status,
              }
            : undefined
          }
          professorId={professorId}
          periodoLetivoId={periodoLetivoId}
          onSubmit={isEditMode ? handleEditSubmit : handleCreateSubmit}
          onCancel={handleCancel}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
