import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

  // Configuração do formulário
  const form = useForm<
    CreateDisponibilidadeFormData | UpdateDisponibilidadeFormData
  >({
    resolver: async (data, context, options) => {
      // Manter apenas o log do zodResolver para debugging
      console.log("🔍 [zodResolver] Validando dados:", {
        data,
        schema: isEditMode ? "update" : "create",
      })

      try {
        const result = await zodResolver(schema)(data, context, options)
        console.log("✅ [zodResolver] Validação bem-sucedida")
        return result
      } catch (error) {
        console.log("❌ [zodResolver] Erro de validação:", error)
        throw error
      }
    },
    defaultValues: {
      idUsuarioProfessor: "",
      idPeriodoLetivo: "",
      status: "DISPONIVEL" as StatusDisponibilidade,
      diaDaSemana: undefined,
      horaInicio: "",
      horaFim: "",
    },
  })

  // Carrega os dados para edição ou define valores padrão para criação
  useEffect(() => {
    if (isEditMode && initialData) {
      // Atualiza o formulário com os dados existentes
      const resetData = {
        idUsuarioProfessor: initialData.idUsuarioProfessor || "",
        idPeriodoLetivo: initialData.idPeriodoLetivo || "",
        status: initialData.status || "DISPONIVEL",
        diaDaSemana: initialData.diaDaSemana || undefined,
        horaInicio: initialData.horaInicio || "",
        horaFim: initialData.horaFim || "",
      }

      form.reset(
        resetData as
          | CreateDisponibilidadeFormData
          | UpdateDisponibilidadeFormData,
      )
    } else if (!isEditMode) {
      // Reseta para valores padrão no modo de criação
      const resetData = {
        idUsuarioProfessor: professorId || "",
        idPeriodoLetivo: periodoLetivoId || "",
        status: "DISPONIVEL" as StatusDisponibilidade,
        diaDaSemana: undefined,
        horaInicio: "",
        horaFim: "",
      }

      form.reset(
        resetData as
          | CreateDisponibilidadeFormData
          | UpdateDisponibilidadeFormData,
      )
    }

    // Limpa erros de validação
    form.clearErrors()
  }, [isEditMode, initialData, professorId, periodoLetivoId, form])

  const handleSubmit = (
    data: CreateDisponibilidadeFormData | UpdateDisponibilidadeFormData,
  ) => {
    onSubmit(data)
  }

  return (
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
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(DIAS_SEMANA_LABELS).map(([value, label]) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ))}
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

          {/* Hora Início */}
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

          {/* Hora Fim */}
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

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X />
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            <Save />
            {isEditMode ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
