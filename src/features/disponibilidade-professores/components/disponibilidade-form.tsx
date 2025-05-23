import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2, Save, X } from "lucide-react"
import {
  createDisponibilidadeSchema,
  updateDisponibilidadeSchema,
  DIAS_SEMANA_LABELS,
  STATUS_DISPONIBILIDADE_LABELS,
} from "../schemas/disponibilidade-schemas"
import type {
  CreateDisponibilidadeFormData,
  UpdateDisponibilidadeFormData,
  StatusDisponibilidade,
} from "../schemas/disponibilidade-schemas"

/**
 * Propriedades do componente DisponibilidadeForm
 */
interface DisponibilidadeFormProps {
  /** Dados iniciais para edição (se não fornecido, será modo criação) */
  initialData?: Partial<UpdateDisponibilidadeFormData> & {
    id?: string
    idUsuarioProfessor?: string
    idPeriodoLetivo?: string
  }
  /** ID do professor (obrigatório no modo criação) */
  professorId?: string
  /** ID do período letivo (obrigatório no modo criação) */
  periodoLetivoId?: string
  /** Callback ao submeter o formulário */
  onSubmit: (
    data: CreateDisponibilidadeFormData | UpdateDisponibilidadeFormData,
  ) => void
  /** Callback ao cancelar */
  onCancel?: () => void
  /** Se está carregando */
  isLoading?: boolean
  /** Modo do formulário */
  mode?: "create" | "edit"
}

/**
 * Componente de formulário para disponibilidades de professores
 */
export function DisponibilidadeForm({
  initialData,
  professorId,
  periodoLetivoId,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
}: DisponibilidadeFormProps) {
  const isEditMode = mode === "edit"
  const schema =
    isEditMode ? updateDisponibilidadeSchema : createDisponibilidadeSchema

  const form = useForm<
    CreateDisponibilidadeFormData | UpdateDisponibilidadeFormData
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(isEditMode ? initialData : (
        {
          idUsuarioProfessor: professorId || "",
          idPeriodoLetivo: periodoLetivoId || "",
          status: "DISPONIVEL" as StatusDisponibilidade,
        }
      )),
    },
  })

  const handleSubmit = (
    data: CreateDisponibilidadeFormData | UpdateDisponibilidadeFormData,
  ) => {
    onSubmit(data)
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Editar Disponibilidade" : "Nova Disponibilidade"}
        </CardTitle>
        <CardDescription>
          {isEditMode ?
            "Altere os campos desejados e clique em salvar."
          : "Preencha os dados da sua disponibilidade de horário."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Dia da Semana */}
              <FormField
                control={form.control}
                name="diaDaSemana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Horário de Início */}
              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="07:30"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Formato: HH:mm (24 horas)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Horário de Fim */}
              <FormField
                control={form.control}
                name="horaFim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Fim</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="12:00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Deve ser maior que o horário de início
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos ocultos para IDs no modo criação */}
            {!isEditMode && (
              <>
                <FormField
                  control={form.control}
                  name="idUsuarioProfessor"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input
                          type="hidden"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idPeriodoLetivo"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input
                          type="hidden"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="sm:order-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="sm:order-2"
              >
                {isLoading ?
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Save className="mr-2 h-4 w-4" />}
                {isEditMode ? "Salvar Alterações" : "Criar Disponibilidade"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
