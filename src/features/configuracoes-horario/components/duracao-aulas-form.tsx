import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import {
  useConfiguracoesHorarioControllerGet,
  useConfiguracoesHorarioControllerUpsert,
  getConfiguracoesHorarioControllerGetQueryKey,
} from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Pencil, Save, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  DURACAO_MAXIMA_PERIODO_MINUTOS,
  DURACAO_MAXIMA_AULA_MINUTOS,
  validarDuracaoTotalPeriodo,
  formatarDuracao,
  calcularDuracaoTotal,
} from "../lib/constants"

const createFormSchema = (numeroAulasPorTurno?: number) =>
  z.object({
    duracaoAulaMinutos: z.coerce
      .number({
        invalid_type_error: "Digite um número válido",
        required_error: "Digite a duração da aula",
      })
      .int({ message: "A duração deve ser um número inteiro" })
      .min(1, { message: "A duração deve ser de pelo menos 1 minuto" })
      .max(DURACAO_MAXIMA_AULA_MINUTOS, {
        message: `A duração não pode ser maior que ${formatarDuracao(DURACAO_MAXIMA_AULA_MINUTOS)}`,
      })
      .refine(
        (duracao) => {
          if (!numeroAulasPorTurno) return true
          return validarDuracaoTotalPeriodo(duracao, numeroAulasPorTurno)
        },
        {
          message: `A duração total das aulas (duração × número de aulas) não pode exceder ${formatarDuracao(DURACAO_MAXIMA_PERIODO_MINUTOS)} por período`,
        },
      ),
  })

export function DuracaoAulasForm() {
  const { data: configuracoesHorario } = useConfiguracoesHorarioControllerGet({})

  const formSchema = createFormSchema(configuracoesHorario?.numeroAulasPorTurno)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duracaoAulaMinutos: 0,
    },
  })
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const { mutate: upsertConfiguracoesHorario } =
    useConfiguracoesHorarioControllerUpsert()

  useEffect(() => {
    if (configuracoesHorario && !isEditing) {
      form.reset({
        duracaoAulaMinutos: configuracoesHorario.duracaoAulaMinutos,
      })
    }
  }, [configuracoesHorario, form, isEditing])

  // Recalcular validação quando o número de aulas mudar
  useEffect(() => {
    if (configuracoesHorario?.numeroAulasPorTurno) {
      // Força revalidação do campo com o novo schema
      form.trigger("duracaoAulaMinutos")
    }
  }, [configuracoesHorario?.numeroAulasPorTurno, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertConfiguracoesHorario(
      {
        data: {
          duracaoAulaMinutos: values.duracaoAulaMinutos,
        },
      },
      {
        onSuccess: () => {
          toast.success("Configurações atualizadas com sucesso")
          queryClient.invalidateQueries({
            queryKey: getConfiguracoesHorarioControllerGetQueryKey(),
          })
          setIsEditing(false)
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Erro ao atualizar configurações",
          )
        },
      },
    )
  }

  // Calcular duração total atual para exibir informações auxiliares
  const duracaoAtual = form.watch("duracaoAulaMinutos")
  const numeroAulas = configuracoesHorario?.numeroAulasPorTurno || 0
  const duracaoTotalMinutos = calcularDuracaoTotal(duracaoAtual, numeroAulas)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full items-center justify-center gap-2"
      >
        <FormField
          control={form.control}
          name="duracaoAulaMinutos"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Duração das Aulas</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  disabled={!isEditing}
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A duração das aulas em minutos (máx. {DURACAO_MAXIMA_AULA_MINUTOS}{" "}
                min).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          {isEditing ?
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    size="icon"
                    disabled={form.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Salvar configurações</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsEditing(false)
                      // Reset form to original values from server
                      form.reset({
                        duracaoAulaMinutos:
                          configuracoesHorario?.duracaoAulaMinutos,
                      })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancelar edição</p>
                </TooltipContent>
              </Tooltip>
            </>
          : <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                  className="flex items-center gap-2"
                  size="icon"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar configurações</p>
              </TooltipContent>
            </Tooltip>
          }
        </div>
      </form>
    </Form>
  )
}
