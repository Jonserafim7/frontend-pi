import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2, Save, X } from "lucide-react"
import { TimeInput } from "@/components/time-input"
import {
  useDisponibilidadeProfessorControllerUpdate,
  getDisponibilidadeProfessorControllerFindAllQueryKey,
  getDisponibilidadeProfessorControllerFindByProfessorQueryKey,
} from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import DIAS_SEMANA_LABELS from "@/lib/constants/dias-da-semana.constant"
import STATUS_DISPONIBILIDADE_LABELS from "@/lib/constants/status-disponibilidade.constant"
import type { DisponibilidadeResponseDto } from "@/api-generated/model/disponibilidade-response-dto"
import { z } from "zod"

const formSchema = z.object({
  diaDaSemana: z.enum([
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
  ]),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  status: z.enum(["DISPONIVEL", "INDISPONIVEL"]),
})

type EditDisponibilidadeFormData = z.infer<typeof formSchema>

interface EditDisponibilidadeFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  disponibilidade: DisponibilidadeResponseDto
}

/**
 * Dialog para edição de disponibilidade existente
 */
export function EditDisponibilidadeFormDialog({
  isOpen,
  onOpenChange,
  disponibilidade,
}: EditDisponibilidadeFormDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<EditDisponibilidadeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diaDaSemana: disponibilidade.diaDaSemana,
      horaInicio: disponibilidade.horaInicio,
      horaFim: disponibilidade.horaFim,
      status: disponibilidade.status ?? "DISPONIVEL",
    },
  })

  useEffect(() => {
    if (isOpen && disponibilidade) {
      form.reset({
        diaDaSemana: disponibilidade.diaDaSemana,
        horaInicio: disponibilidade.horaInicio,
        horaFim: disponibilidade.horaFim,
        status: disponibilidade.status ?? "DISPONIVEL", // Ensure status is never undefined
      })
    }
  }, [isOpen, disponibilidade, form])

  const updateMutation = useDisponibilidadeProfessorControllerUpdate({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: getDisponibilidadeProfessorControllerFindAllQueryKey(),
        })
        if (data.usuarioProfessor?.id) {
          queryClient.invalidateQueries({
            queryKey:
              getDisponibilidadeProfessorControllerFindByProfessorQueryKey(
                data.usuarioProfessor.id,
              ),
          })
        }
        toast({
          title: "Disponibilidade atualizada com sucesso!",
          variant: "default",
        })
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        const errorMessage =
          error?.request?.response || "Erro ao atualizar disponibilidade"
        console.error("Erro ao atualizar disponibilidade:", error)
        toast({
          title: "Erro ao atualizar disponibilidade",
          description: errorMessage,
          variant: "destructive",
        })
      },
    },
  })

  const handleSubmit = (data: EditDisponibilidadeFormData) => {
    updateMutation.mutate({
      id: disponibilidade.id,
      data: data,
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Disponibilidade</DialogTitle>
          <DialogDescription>
            Atualize os campos da disponibilidade e clique em Salvar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="diaDaSemana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DIAS_SEMANA_LABELS).map(
                          ([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                            >
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_DISPONIBILIDADE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                            >
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <TimeInput
                        value={field.value}
                        onChange={field.onChange}
                        aria-label="Hora de início"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="horaFim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fim</FormLabel>
                    <FormControl>
                      <TimeInput
                        value={field.value}
                        onChange={field.onChange}
                        aria-label="Hora de fim"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <X />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="animate-spin" />}
                <Save />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
