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
            <CheckCircle className="h-5 w-5 text-green-600" />
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
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
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
                <span className="font-semibold text-green-600">APROVADA</span> e
                não poderá mais ser modificada.
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
                className="bg-green-600 hover:bg-green-700"
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
            <XCircle className="h-5 w-5 text-red-600" />
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
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
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
                  <FormLabel className="text-red-700">
                    Justificativa da Rejeição{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explique os motivos da rejeição desta proposta..."
                      className="min-h-[120px] resize-none border-red-200 focus:border-red-300"
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
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                A proposta ficará com status{" "}
                <span className="font-semibold text-red-600">REJEITADA</span> e o
                coordenador poderá reabri-la para nova edição.
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
