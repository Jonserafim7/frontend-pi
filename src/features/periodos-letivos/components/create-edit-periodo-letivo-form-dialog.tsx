import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type {
  PeriodoLetivoResponseDto,
  CreatePeriodoLetivoDtoStatus,
} from "@/api-generated/model"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getPeriodosLetivosControllerFindAllQueryKey,
  usePeriodosLetivosControllerCreate,
  usePeriodosLetivosControllerUpdate,
} from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

// Definindo schema para o formulário interno
const formSchema = z
  .object({
    ano: z.number().min(2000).max(2100),
    semestre: z.number().min(1).max(2),
    status: z.enum(["ATIVO", "INATIVO"]).optional(),
    dataInicio: z.date({
      required_error: "Data de início é obrigatória",
    }),
    dataFim: z.date({
      required_error: "Data de fim é obrigatória",
    }),
  })
  .refine((data) => data.dataFim > data.dataInicio, {
    message: "Data de fim deve ser posterior à data de início",
    path: ["dataFim"],
  })

type FormValues = z.infer<typeof formSchema>

interface CreateEditPeriodoLetivoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  periodoLetivo?: PeriodoLetivoResponseDto
  onSuccess: () => void
}

/**
 * Componente de diálogo para criar ou editar um Período Letivo.
 * Utiliza react-hook-form para gerenciamento de formulário e Zod para validação.
 */
export const CreateEditPeriodoLetivoFormDialog: React.FC<
  CreateEditPeriodoLetivoFormDialogProps
> = ({ open, onOpenChange, mode, periodoLetivo, onSuccess }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ano: new Date().getFullYear(),
      semestre: 1,
      status: "INATIVO" as CreatePeriodoLetivoDtoStatus,
      dataInicio: new Date(),
      dataFim: new Date(),
    },
  })

  const { mutate: mutateCreate, isPending: isCreating } =
    usePeriodosLetivosControllerCreate()
  const { mutate: mutateUpdate, isPending: isUpdating } =
    usePeriodosLetivosControllerUpdate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const isPending = isCreating || isUpdating

  // Efeito para resetar o formulário quando o período letivo ou o modo mudar
  useEffect(() => {
    if (open && periodoLetivo) {
      form.reset({
        ano: periodoLetivo?.ano,
        semestre: periodoLetivo?.semestre,
        status: periodoLetivo?.status ?? "INATIVO",
        dataInicio:
          periodoLetivo?.dataInicio ?
            new Date(periodoLetivo.dataInicio)
          : new Date(),
        dataFim:
          periodoLetivo?.dataFim ? new Date(periodoLetivo.dataFim) : new Date(),
      })
    } else if (open && mode === "create") {
      form.reset({
        ano: new Date().getFullYear(),
        semestre: 1,
        status: "INATIVO",
        dataInicio: new Date(),
        dataFim: new Date(),
      })
    }
  }, [form, mode, periodoLetivo, open])

  // Função para transformar os valores do formulário para enviar à API
  const prepareDataForSubmission = (values: FormValues) => {
    return {
      ano: values.ano,
      semestre: values.semestre,
      status: values.status,
      // Formata as datas como strings no formato YYYY-MM-DD
      dataInicio: values.dataInicio.toISOString().split("T")[0],
      dataFim: values.dataFim.toISOString().split("T")[0],
    }
  }

  const onSubmit = async (values: FormValues) => {
    console.log("onSubmit called with values:", values)
    console.log("Current mode:", mode)
    console.log("Current periodoLetivo:", periodoLetivo)

    const dataToSubmit = prepareDataForSubmission(values)
    console.log("dataToSubmit:", dataToSubmit)

    if (mode === "create") {
      console.log("Executing create logic...")
      mutateCreate(
        { data: dataToSubmit },
        {
          onSuccess: () => {
            toast({
              title: "Período Letivo criado com sucesso!",
            })
            queryClient.invalidateQueries({
              queryKey: getPeriodosLetivosControllerFindAllQueryKey(),
            })
            onSuccess()
            onOpenChange(false)
          },
          onError: (error: AxiosError) => {
            const errorMessage =
              (
                error.response?.data as { message?: string | string[] }
              )?.message?.toString() ||
              error.message ||
              "Erro ao criar período letivo"
            console.error("Erro ao criar período letivo:", error)
            toast({
              title: "Erro ao criar período letivo",
              description: errorMessage,
              variant: "destructive",
            })
          },
        },
      )
    } else if (periodoLetivo?.id) {
      console.log(
        "Executing update logic with periodoLetivo.id:",
        periodoLetivo.id,
      )
      mutateUpdate(
        { id: periodoLetivo.id, data: dataToSubmit },
        {
          onSuccess: () => {
            toast({
              title: "Período Letivo atualizado com sucesso!",
            })
            queryClient.invalidateQueries({
              queryKey: getPeriodosLetivosControllerFindAllQueryKey(),
            })
            onSuccess()
            onOpenChange(false)
          },
          onError: (error: AxiosError) => {
            const errorMessage =
              (
                error.response?.data as { message?: string | string[] }
              )?.message?.toString() ||
              error.message ||
              "Erro ao atualizar período letivo"
            console.error("Erro ao atualizar período letivo (onError):", error)
            toast({
              title: "Erro ao atualizar período letivo",
              description: errorMessage,
              variant: "destructive",
            })
          },
        },
      )
    } else {
      console.warn(
        "onSubmit called but no mode matched (create or update with id).",
      )
    }
  }

  const dialogTitle =
    mode === "create" ? "Criar Novo Período Letivo" : "Editar Período Letivo"
  const dialogDescription =
    mode === "create" ?
      "Preencha os dados para criar um novo período letivo."
    : "Modifique os dados do período letivo existente."

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2024"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semestre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semestre</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1 ou 2"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Apenas um período letivo pode estar ativo por vez.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataInicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ?
                            format(field.value, "PPP", { locale: ptBR })
                          : <span>Escolha uma data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataFim"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Término</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ?
                            format(field.value, "PPP", { locale: ptBR })
                          : <span>Escolha uma data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        locale={ptBR}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ?
                  "Salvando..."
                : mode === "create" ?
                  "Criar"
                : "Atualizar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
