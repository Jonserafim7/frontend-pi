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
import { Undo, AlertTriangle } from "lucide-react"
import { useSendBackProposta } from "../hooks/use-propostas-horario"
import { toast } from "sonner"

const sendBackPropostaSchema = z.object({
  motivoDevolucao: z
    .string()
    .min(10, "Digite pelo menos 10 caracteres para o motivo")
    .max(500, "O motivo deve ter no máximo 500 caracteres"),
})

type SendBackPropostaFormData = z.infer<typeof sendBackPropostaSchema>

interface SendBackDialogProps {
  propostaId: string
  cursoNome: string
  coordenadorNome: string
  children: React.ReactNode
  onSuccess?: () => void
}

/**
 * Dialog para devolução de proposta aprovada para edição
 * Usado por diretores para devolver propostas aprovadas de volta para DRAFT
 */
export function SendBackDialog({
  propostaId,
  cursoNome,
  coordenadorNome,
  children,
  onSuccess,
}: SendBackDialogProps) {
  const [open, setOpen] = useState(false)
  const sendBackPropostaMutation = useSendBackProposta()

  const form = useForm<SendBackPropostaFormData>({
    resolver: zodResolver(sendBackPropostaSchema),
    defaultValues: {
      motivoDevolucao: "",
    },
  })

  const handleSubmit = async (data: SendBackPropostaFormData) => {
    sendBackPropostaMutation.mutate(
      {
        id: propostaId,
        data: {
          motivoDevolucao: data.motivoDevolucao,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
          onSuccess?.()
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Erro ao devolver proposta",
          )
        },
      },
    )
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
            <Undo className="text-chart-2 h-5 w-5" />
            Devolver para Edição
          </DialogTitle>
          <DialogDescription>
            Devolver a proposta aprovada para o coordenador fazer alterações.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Informações da Proposta */}
            <Alert className="border-chart-2/30 bg-chart-2/10">
              <Undo className="text-chart-2 h-4 w-4" />
              <AlertDescription className="text-chart-2">
                <strong>Devolver proposta:</strong>
                <br />
                <span className="text-sm">
                  Curso: {cursoNome}
                  <br />
                  Coordenador(a): {coordenadorNome}
                </span>
              </AlertDescription>
            </Alert>

            {/* Campo de Motivo (Obrigatório) */}
            <FormField
              control={form.control}
              name="motivoDevolucao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-chart-2">
                    Motivo da Devolução <span className="text-chart-2">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explique por que esta proposta está sendo devolvida para edição..."
                      className="border-chart-2/30 focus:border-chart-2/50 min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aviso sobre mudança de status */}
            <Alert className="border-muted-foreground/30">
              <AlertTriangle className="text-muted-foreground h-4 w-4" />
              <AlertDescription className="text-muted-foreground text-sm">
                A proposta voltará para status{" "}
                <span className="text-primary font-semibold">RASCUNHO</span> e o
                coordenador poderá fazer novas edições e submeter novamente.
              </AlertDescription>
            </Alert>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={sendBackPropostaMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={sendBackPropostaMutation.isPending}
                className="bg-chart-2 hover:bg-chart-2/90"
              >
                {sendBackPropostaMutation.isPending ?
                  "Devolvendo..."
                : "Devolver para Edição"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
