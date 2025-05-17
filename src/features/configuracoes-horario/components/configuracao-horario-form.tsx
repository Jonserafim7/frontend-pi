import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
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
import { TimeInput } from "@/components/time-input"
import {
  configuracaoHorarioSchema,
  type ConfiguracaoHorarioSchema,
} from "../schemas/configuracao-horario.schema"
import type {
  ConfiguracaoHorarioDto,
  UpsertConfiguracaoHorarioDto,
} from "@/api-generated/model"
import { useEffect } from "react"
import { Loader2, SaveIcon } from "lucide-react"

interface ConfiguracaoHorarioFormProps {
  valoresIniciais?: ConfiguracaoHorarioDto | null
  onSubmit: (valores: UpsertConfiguracaoHorarioDto) => Promise<void>
  isSubmitting?: boolean
  textoBotaoSubmit?: string
}

/**
 * Componente de formulário para criar ou editar as configurações globais de horário.
 */
export function ConfiguracaoHorarioForm({
  valoresIniciais,
  onSubmit,
  isSubmitting = false,
  textoBotaoSubmit = "Salvar Configurações",
}: ConfiguracaoHorarioFormProps) {
  const form = useForm<ConfiguracaoHorarioSchema>({
    resolver: zodResolver(configuracaoHorarioSchema),
    defaultValues: {
      duracaoAulaMinutos: valoresIniciais?.duracaoAulaMinutos || 50,
      qtdAulasPorBloco: valoresIniciais?.qtdAulasPorBloco || 2,
      inicioTurnoManha: valoresIniciais?.inicioTurnoManha || "07:30",
      fimTurnoManha: valoresIniciais?.fimTurnoManha || "12:00",
      inicioTurnoTarde: valoresIniciais?.inicioTurnoTarde || "13:30",
      fimTurnoTarde: valoresIniciais?.fimTurnoTarde || "18:00",
      inicioTurnoNoite: valoresIniciais?.inicioTurnoNoite || "19:00",
      fimTurnoNoite: valoresIniciais?.fimTurnoNoite || "22:30",
    },
  })

  useEffect(() => {
    if (valoresIniciais) {
      form.reset({
        duracaoAulaMinutos: valoresIniciais.duracaoAulaMinutos,
        qtdAulasPorBloco: valoresIniciais.qtdAulasPorBloco,
        inicioTurnoManha: valoresIniciais.inicioTurnoManha,
        fimTurnoManha: valoresIniciais.fimTurnoManha,
        inicioTurnoTarde: valoresIniciais.inicioTurnoTarde,
        fimTurnoTarde: valoresIniciais.fimTurnoTarde,
        inicioTurnoNoite: valoresIniciais.inicioTurnoNoite,
        fimTurnoNoite: valoresIniciais.fimTurnoNoite,
      } as ConfiguracaoHorarioSchema)
    }
  }, [valoresIniciais, form])

  const turnos = [
    {
      periodo: "Manhã",
      inicioName: "inicioTurnoManha" as const,
      inicioLabel: "Início Turno Manhã",
      inicioDescription: "Horário de início do turno da manhã.",
      fimName: "fimTurnoManha" as const,
      fimLabel: "Fim Turno Manhã",
      fimDescription: "Horário de término do turno da manhã.",
    },
    {
      periodo: "Tarde",
      inicioName: "inicioTurnoTarde" as const,
      inicioLabel: "Início Turno Tarde",
      inicioDescription: "Horário de início do turno da tarde.",
      fimName: "fimTurnoTarde" as const,
      fimLabel: "Fim Turno Tarde",
      fimDescription: "Horário de término do turno da tarde.",
    },
    {
      periodo: "Noite",
      inicioName: "inicioTurnoNoite" as const,
      inicioLabel: "Início Turno Noite",
      inicioDescription: "Horário de início do turno da noite.",
      fimName: "fimTurnoNoite" as const,
      fimLabel: "Fim Turno Noite",
      fimDescription: "Horário de término do turno da noite.",
    },
  ]

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="duracaoAulaMinutos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração da Aula (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Define a duração padrão de cada aula em minutos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="qtdAulasPorBloco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aulas por Bloco</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 2"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Quantidade de aulas consecutivas em um mesmo bloco.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Horarios dos Turnos */}
        <div className="space-y-6">
          {turnos.map((turno) => (
            <div
              key={turno.periodo}
              className="bg-card space-y-4 rounded-md border p-4 shadow-sm"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Turno {turno.periodo}
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={turno.inicioName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{turno.inicioLabel}</FormLabel>
                      <FormControl>
                        <TimeInput
                          {...field}
                          isDisabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>{turno.inicioDescription}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={turno.fimName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{turno.fimLabel}</FormLabel>
                      <FormControl>
                        <TimeInput
                          {...field}
                          isDisabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>{turno.fimDescription}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isSubmitting && <SaveIcon className="mr-2 h-4 w-4" />}
            {textoBotaoSubmit}
          </Button>
        </div>
      </form>
    </Form>
  )
}
