import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useUpdateTurma } from "../hooks/use-turmas"
import type { TurmaResponseDto } from "@/api-generated/model"

/**
 * Schema de validação para edição de turma
 */
const editTurmaSchema = z.object({
  codigoDaTurma: z
    .string()
    .min(1, "Código da turma é obrigatório")
    .max(10, "Código deve ter no máximo 10 caracteres"),
})

type EditTurmaFormData = z.infer<typeof editTurmaSchema>

interface EditTurmaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turma: TurmaResponseDto | null
  onSuccess?: () => void
}

/**
 * Modal para edição de turma
 */
export function EditTurmaModal({
  open,
  onOpenChange,
  turma,
  onSuccess,
}: EditTurmaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hook para atualizar turma
  const updateTurmaMutation = useUpdateTurma()

  // Configurar form com React Hook Form + Zod
  const form = useForm<EditTurmaFormData>({
    resolver: zodResolver(editTurmaSchema),
    defaultValues: {
      codigoDaTurma: "",
    },
  })

  // Atualizar valores do form quando a turma mudar
  useEffect(() => {
    if (turma) {
      form.reset({
        codigoDaTurma: turma.codigoDaTurma,
      })
    }
  }, [turma, form])

  /**
   * Handler para envio do formulário
   */
  const onSubmit = async (data: EditTurmaFormData) => {
    if (!turma) return

    try {
      setIsSubmitting(true)

      await updateTurmaMutation.mutateAsync({
        id: turma.id,
        data: {
          codigoDaTurma: data.codigoDaTurma,
        },
      })

      // Fechar modal
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao atualizar turma:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handler para fechar modal
   */
  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Turma</DialogTitle>
          <DialogDescription>
            Edite as informações da turma <strong>{turma?.codigoDaTurma}</strong>
            {turma?.disciplinaOfertada?.disciplina?.nome && (
              <> de {turma.disciplinaOfertada.disciplina.nome}</>
            )}
            .
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Informações da Disciplina (readonly) */}
            {turma?.disciplinaOfertada && (
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Disciplina:</span>{" "}
                    {turma.disciplinaOfertada.disciplina?.nome}
                  </div>
                  <div>
                    <span className="font-medium">Período:</span>{" "}
                    {turma.disciplinaOfertada.periodoLetivo?.ano}/
                    {turma.disciplinaOfertada.periodoLetivo?.semestre}º Semestre
                  </div>
                  {turma.disciplinaOfertada.disciplina?.codigo && (
                    <div>
                      <span className="font-medium">Código:</span>{" "}
                      {turma.disciplinaOfertada.disciplina.codigo}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Código da Turma */}
            <FormField
              control={form.control}
              name="codigoDaTurma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código da Turma</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: T1, T2, A, B..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
