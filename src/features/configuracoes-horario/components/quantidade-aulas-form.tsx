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
import { AxiosError } from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Pencil, Save, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

const formSchema = z.object({
  quantidade_aulas: z.coerce
    .number({
      invalid_type_error: "Digite um número válido",
      required_error: "Digite a quantidade de aulas",
    })
    .int({ message: "A quantidade deve ser um número inteiro" })
    .min(1, { message: "A quantidade deve ser de pelo menos 1 aula" })
    .max(20, { message: "A quantidade não pode ser maior que 20 aulas" }),
})

export function QuantidadeAulasForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantidade_aulas: 0,
    },
  })
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const { data: configuracoesHorario } = useConfiguracoesHorarioControllerGet({})
  const { mutate: upsertConfiguracoesHorario } =
    useConfiguracoesHorarioControllerUpsert()

  useEffect(() => {
    if (configuracoesHorario && !isEditing) {
      form.reset({
        quantidade_aulas: configuracoesHorario.numeroAulasPorTurno,
      })
    }
  }, [configuracoesHorario, form, isEditing])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertConfiguracoesHorario(
      {
        data: {
          numeroAulasPorTurno: values.quantidade_aulas,
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
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-center gap-2"
      >
        <FormField
          control={form.control}
          name="quantidade_aulas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Aulas</FormLabel>
              <FormControl>
                <Input
                  disabled={!isEditing}
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>A quantidade de aulas por turno.</FormDescription>
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
                        quantidade_aulas:
                          configuracoesHorario?.numeroAulasPorTurno,
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
