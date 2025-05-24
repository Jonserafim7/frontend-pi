import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/features/auth/contexts/auth-context"
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
import { HeaderIconContainer } from "@/components/icon-container"
import { Clock, Loader2, Save, X } from "lucide-react"
import { TimeInput } from "@/components/time-input"
import {
  useDisponibilidadeProfessorControllerCreate,
  getDisponibilidadeProfessorControllerFindAllQueryKey,
  getDisponibilidadeProfessorControllerFindByProfessorQueryKey,
} from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { disponibilidadeProfessorControllerCreateBody } from "@/api-generated/zod-schemas/disponibilidade-de-professores/disponibilidade-de-professores"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { z } from "zod"
import DIAS_SEMANA_LABELS from "@/lib/constants/dias-da-semana.constant"
import STATUS_DISPONIBILIDADE_LABELS from "@/lib/constants/status-disponibilidade.constant"

type CreateDisponibilidadeFormData = z.infer<
  typeof disponibilidadeProfessorControllerCreateBody
>

interface CreateDisponibilidadeFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  professorId?: string
  periodoLetivoId?: string
}

/**
 * Dialog para criação de disponibilidades (só criação por enquanto)
 */
export function CreateDisponibilidadeFormDialog({
  isOpen,
  onOpenChange,
  professorId,
  periodoLetivoId,
}: CreateDisponibilidadeFormDialogProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<CreateDisponibilidadeFormData>({
    resolver: zodResolver(disponibilidadeProfessorControllerCreateBody),
    defaultValues: {
      idUsuarioProfessor: "",
      idPeriodoLetivo: "",
      diaDaSemana: "SEGUNDA",
      horaInicio: "",
      horaFim: "",
      status: "DISPONIVEL",
    },
  })

  const createMutation = useDisponibilidadeProfessorControllerCreate({
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
          title: "Disponibilidade criada com sucesso!",
          variant: "default",
        })
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        const errorMessage =
          error?.request.response || "Erro ao criar disponibilidade"
        console.error("Erro ao criar disponibilidade:", error)
        toast({
          title: "Erro ao criar disponibilidade",
          description: errorMessage,
          variant: "destructive",
        })
      },
    },
  })

  useEffect(() => {
    if (isOpen) {
      const resetData = {
        idUsuarioProfessor: user?.id || professorId || "",
        idPeriodoLetivo: periodoLetivoId || "",
        diaDaSemana: "SEGUNDA" as const,
        horaInicio: "",
        horaFim: "",
        status: "DISPONIVEL" as const,
      }
      form.reset(resetData)
    }
  }, [isOpen, professorId, periodoLetivoId, form, user?.id])

  const handleSubmit = (data: CreateDisponibilidadeFormData) => {
    const submitData = {
      ...data,
      idUsuarioProfessor: user?.id || data.idUsuarioProfessor,
    }
    createMutation.mutate({ data: submitData })
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
      <DialogContent className="gap-8 sm:max-w-[600px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={Clock} />
          <div>
            <DialogTitle className="text-2xl font-bold">
              Nova Disponibilidade
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da sua disponibilidade de horário.
            </DialogDescription>
          </div>
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
                        value={field.value ?? ""}
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
                        value={field.value ?? ""}
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="animate-spin" />}
                <Save />
                Criar Disponibilidade
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
