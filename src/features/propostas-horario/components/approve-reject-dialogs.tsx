import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import {
  useApproveProposta,
  useRejectProposta,
} from "../hooks/use-propostas-horario"
import { toast } from "sonner"

// Schemas de validação
const approvePropostaSchema = z.object({
  observacoesDiretor: z.string().optional(),
})

const rejectPropostaSchema = z.object({
  justificativaRejeicao: z
    .string()
    .min(10, "A justificativa deve ter pelo menos 10 caracteres")
    .max(500, "A justificativa não pode exceder 500 caracteres"),
  observacoesDiretor: z.string().optional(),
})

type ApprovePropostaFormData = z.infer<typeof approvePropostaSchema>
type RejectPropostaFormData = z.infer<typeof rejectPropostaSchema>

interface ApprovePropostaDialogProps {
  propostaId: string
  cursoNome: string
  coordenadorNome: string
  children: React.ReactNode
  onSuccess?: () => void
}

interface RejectPropostaDialogProps {
  propostaId: string
  cursoNome: string
  coordenadorNome: string
  children: React.ReactNode
  onSuccess?: () => void
}

/**
 * Dialog para aprovação de proposta
 * Task 6.1: Dialog de aprovação com campo opcional para observações do diretor
 */
export function ApprovePropostaDialog({
  propostaId,
  cursoNome,
  coordenadorNome,
  children,
  onSuccess,
}: ApprovePropostaDialogProps) {
  const [open, setOpen] = useState(false)
  const approvePropostaMutation = useApproveProposta()

  const form = useForm<ApprovePropostaFormData>({
    resolver: zodResolver(approvePropostaSchema),
    defaultValues: {
      observacoesDiretor: "",
    },
  })

  const handleSubmit = async (data: ApprovePropostaFormData) => {
    try {
      await approvePropostaMutation.mutateAsync({
        id: propostaId,
        data: {
          observacoesDiretor: data.observacoesDiretor || undefined,
        },
      })

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao aprovar proposta:", error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    setOpen(newOpen)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="text-accent-foreground h-5 w-5" />
            Aprovar Proposta
          </DialogTitle>
          <DialogDescription>
            Aprovar a proposta de horário para o curso {cursoNome}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Informações da Proposta */}
            <Alert className="border-accent/30 bg-accent/10">
              <CheckCircle className="text-accent-foreground h-4 w-4" />
              <AlertDescription className="text-accent-foreground">
                <strong>Aprovar proposta:</strong>
                <br />
                <span className="text-sm">
                  Curso: {cursoNome}
                  <br />
                  Coordenador(a): {coordenadorNome}
                </span>
              </AlertDescription>
            </Alert>

            {/* Campo de Observações */}
            <FormField
              control={form.control}
              name="observacoesDiretor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre a aprovação..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aviso sobre mudança de status */}
            <Alert>
              <AlertDescription className="text-sm">
                Esta ação é <strong>irreversível</strong>. A proposta ficará com
                status{" "}
                <span className="text-accent-foreground font-semibold">
                  APROVADA
                </span>{" "}
                e não poderá mais ser modificada.
              </AlertDescription>
            </Alert>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={approvePropostaMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={approvePropostaMutation.isPending}
                className="bg-accent hover:bg-accent/90"
              >
                {approvePropostaMutation.isPending ?
                  "Aprovando..."
                : "Aprovar Proposta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Dialog para rejeição de proposta
 * Task 6.2: Dialog de rejeição com campo obrigatório para justificativa
 */
export function RejectPropostaDialog({
  propostaId,
  cursoNome,
  coordenadorNome,
  children,
  onSuccess,
}: RejectPropostaDialogProps) {
  const [open, setOpen] = useState(false)
  const rejectPropostaMutation = useRejectProposta()

  const form = useForm<RejectPropostaFormData>({
    resolver: zodResolver(rejectPropostaSchema),
    defaultValues: {
      justificativaRejeicao: "",
      observacoesDiretor: "",
    },
  })

  const handleSubmit = async (data: RejectPropostaFormData) => {
    try {
      await rejectPropostaMutation.mutateAsync({
        id: propostaId,
        data: {
          justificativaRejeicao: data.justificativaRejeicao,
          observacoesDiretor: data.observacoesDiretor || undefined,
        },
      })

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao rejeitar proposta:", error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    setOpen(newOpen)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="text-destructive h-5 w-5" />
            Rejeitar Proposta
          </DialogTitle>
          <DialogDescription>
            Rejeitar a proposta de horário para o curso {cursoNome}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Informações da Proposta */}
            <Alert className="border-destructive/30 bg-destructive/10">
              <XCircle className="text-destructive h-4 w-4" />
              <AlertDescription className="text-destructive">
                <strong>Rejeitar proposta:</strong>
                <br />
                <span className="text-sm">
                  Curso: {cursoNome}
                  <br />
                  Coordenador(a): {coordenadorNome}
                </span>
              </AlertDescription>
            </Alert>

            {/* Campo de Justificativa (Obrigatório) */}
            <FormField
              control={form.control}
              name="justificativaRejeicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-destructive">
                    Justificativa da Rejeição{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explique os motivos da rejeição desta proposta..."
                      className="border-destructive/30 focus:border-destructive/50 min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Observações Adicionais */}
            <FormField
              control={form.control}
              name="observacoesDiretor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Adicionais (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione orientações ou sugestões para melhoria..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aviso sobre mudança de status */}
            <Alert className="border-chart-2/30 bg-chart-2/10">
              <AlertTriangle className="text-chart-2 h-4 w-4" />
              <AlertDescription className="text-chart-2 text-sm">
                A proposta ficará com status{" "}
                <span className="text-destructive font-semibold">REJEITADA</span>{" "}
                e o coordenador poderá reabri-la para nova edição.
              </AlertDescription>
            </Alert>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={rejectPropostaMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={rejectPropostaMutation.isPending}
                variant="destructive"
              >
                {rejectPropostaMutation.isPending ?
                  "Rejeitando..."
                : "Rejeitar Proposta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
