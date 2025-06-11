import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { TimeInput } from "@/components/time-input"
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
  HORARIOS_LIMITE_TURNOS,
  validarHorarioTurno,
  getMensagemErroHorarioTurno,
} from "../lib/constants"
import type { TurnoType } from "../lib/constants"

/**
 * Schema para validação do formulário de horário de início de turno
 */
const createFormSchema = (turno: TurnoType) =>
  z.object({
    horarioInicio: z
      .string()
      .min(1, "Digite o horário de início")
      .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Digite um horário válido no formato HH:MM (ex: 08:00)",
      })
      .refine((horario) => validarHorarioTurno(horario, turno), {
        message: getMensagemErroHorarioTurno(turno),
      }),
  })

/**
 * Props para o componente HorarioInicioTurnoForm
 */
type HorarioInicioTurnoFormProps = {
  turno: TurnoType
}

/**
 * Componente para editar o horário de início de um turno específico (manhã, tarde ou noite)
 *
 * O componente valida automaticamente se o horário está dentro dos limites permitidos:
 * - Manhã: 06:00 às 12:00
 * - Tarde: 12:00 às 18:00
 * - Noite: 18:00 às 23:59
 */
export function HorarioInicioTurnoForm({ turno }: HorarioInicioTurnoFormProps) {
  const formSchema = createFormSchema(turno)
  type FormType = z.infer<typeof formSchema>

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      horarioInicio: "",
    },
  })
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const { data: configuracoesHorario } = useConfiguracoesHorarioControllerGet({})
  const { mutate: upsertConfiguracoesHorario } =
    useConfiguracoesHorarioControllerUpsert()

  // Mapeamento dos nomes dos campos no backend de acordo com o turno
  const campoHorarioMap = {
    manha: "inicioTurnoManha",
    tarde: "inicioTurnoTarde",
    noite: "inicioTurnoNoite",
  } as const

  // Nome do campo no backend com base no turno selecionado
  const campoHorario = campoHorarioMap[turno]

  // Informações do turno
  const infoTurno = HORARIOS_LIMITE_TURNOS[turno]

  useEffect(() => {
    if (configuracoesHorario && !isEditing) {
      // Atualiza o formulário com o valor correto para o turno específico
      form.reset({
        horarioInicio: configuracoesHorario[campoHorario] || "",
      })
    }
  }, [configuracoesHorario, form, isEditing, campoHorario])

  /**
   * Função para processar o envio do formulário
   */
  const onSubmit = (values: FormType) => {
    // Criando um objeto com a estrutura esperada pelo backend
    // onde apenas o campo do turno específico será atualizado
    const updateData = {
      [campoHorario]: values.horarioInicio,
    }

    upsertConfiguracoesHorario(
      {
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success(
            `O horário de início do turno da ${infoTurno.nome.toLowerCase()} foi atualizado para ${values.horarioInicio}.`,
          )
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
          name="horarioInicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início do Turno da {infoTurno.nome}</FormLabel>
              <FormControl>
                <TimeInput
                  isDisabled={!isEditing || form.formState.isSubmitting}
                  value={field.value}
                  onChange={field.onChange}
                  aria-label={`Horário de início do turno da ${infoTurno.nome.toLowerCase()}`}
                />
              </FormControl>
              <FormDescription>
                O horário de início do turno da {infoTurno.nome.toLowerCase()}
                (permitido: {infoTurno.inicio} às {infoTurno.fim}).
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
                        horarioInicio: configuracoesHorario?.[campoHorario] || "",
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
