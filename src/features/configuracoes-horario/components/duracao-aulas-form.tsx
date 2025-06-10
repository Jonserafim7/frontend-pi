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
  duracaoAulaMinutos: z.coerce
    .number({
      invalid_type_error: "A duração da aula deve ser um número.",
      required_error: "A duração da aula é obrigatória.",
    })
    .int({ message: "A duração deve ser um número inteiro de minutos." })
    .min(1, { message: "A duração mínima da aula é de 1 minuto." }),
})

export function DuracaoAulasForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duracaoAulaMinutos: 0,
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
        duracaoAulaMinutos: configuracoesHorario.duracaoAulaMinutos,
      })
    }
  }, [configuracoesHorario, form, isEditing])

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
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-center gap-2"
      >
        <FormField
          control={form.control}
          name="duracaoAulaMinutos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração das Aulas</FormLabel>
              <FormControl>
                <Input
                  disabled={!isEditing}
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>A duração das aulas em minutos.</FormDescription>
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
