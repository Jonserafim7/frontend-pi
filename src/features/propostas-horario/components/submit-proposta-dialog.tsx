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
import { Send, AlertTriangle, CheckCircle } from "lucide-react"
import { useSubmitProposta } from "../hooks/use-propostas-horario"
import { toast } from "sonner"

const submitPropostaSchema = z.object({
  observacoesCoordenador: z.string().optional(),
})

type SubmitPropostaFormData = z.infer<typeof submitPropostaSchema>

interface SubmitPropostaDialogProps {
  propostaId: string
  quantidadeAlocacoes: number
  children: React.ReactNode
  onSuccess?: () => void
}

/**
 * Dialog para submissão de proposta com validação de alocações mínimas
 * Task 4.4 e 4.5: Botão "Submeter" com validação + Dialog com observações
 */
export function SubmitPropostaDialog({
  propostaId,
  quantidadeAlocacoes,
  children,
  onSuccess,
}: SubmitPropostaDialogProps) {
  const [open, setOpen] = useState(false)
  const submitPropostaMutation = useSubmitProposta()

  const form = useForm<SubmitPropostaFormData>({
    resolver: zodResolver(submitPropostaSchema),
    defaultValues: {
      observacoesCoordenador: "",
    },
  })

  const hasMinimumAllocations = quantidadeAlocacoes > 0

  const handleSubmit = async (data: SubmitPropostaFormData) => {
    if (!hasMinimumAllocations) {
      toast.error("Adicione pelo menos uma alocação antes de submeter")
      return
    }

    try {
      await submitPropostaMutation.mutateAsync({
        id: propostaId,
        data: {
          observacoesCoordenador: data.observacoesCoordenador || undefined,
        },
      })

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error já tratado no hook
      console.error("Erro ao submeter proposta:", error)
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
            <Send className="text-primary h-5 w-5" />
            Submeter Proposta
          </DialogTitle>
          <DialogDescription>
            Enviar a proposta de horário para aprovação da direção.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Validação de Alocações Mínimas */}
            {!hasMinimumAllocations && (
              <Alert className="border-chart-2/30 bg-chart-2/10">
                <AlertTriangle className="text-chart-2 h-4 w-4" />
                <AlertDescription className="text-chart-2">
                  <strong>Atenção:</strong> É necessário adicionar pelo menos uma
                  alocação de turma antes de submeter a proposta.
                </AlertDescription>
              </Alert>
            )}

            {hasMinimumAllocations && (
              <Alert className="border-accent/30 bg-accent/10">
                <CheckCircle className="text-accent-foreground h-4 w-4" />
                <AlertDescription className="text-accent-foreground">
                  <strong>Pronto para submissão:</strong> A proposta possui{" "}
                  {quantidadeAlocacoes} alocações e pode ser submetida.
                </AlertDescription>
              </Alert>
            )}

            {/* Campo de Observações */}
            <FormField
              control={form.control}
              name="observacoesCoordenador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações ou comentários sobre a proposta..."
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
                Após a submissão, a proposta ficará com status{" "}
                <span className="text-chart-2 font-semibold">PENDENTE</span> e não
                poderá mais ser editada até que seja aprovada ou rejeitada.
              </AlertDescription>
            </Alert>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitPropostaMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !hasMinimumAllocations || submitPropostaMutation.isPending
                }
                className="bg-primary hover:bg-primary/90"
              >
                {submitPropostaMutation.isPending ?
                  "Submetendo..."
                : "Submeter Proposta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
