import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  useDisciplinasOfertadasControllerCreate,
  useDisciplinasOfertadasControllerUpdate,
  getDisciplinasOfertadasControllerFindAllQueryKey,
} from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import { useDisciplinasControllerFindAll } from "@/api-generated/client/disciplinas/disciplinas"
import { usePeriodosLetivosControllerFindAll } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import {
  disciplinasOfertadasControllerCreateBody,
  disciplinasOfertadasControllerUpdateBody,
} from "@/api-generated/zod-schemas/disciplinas-ofertadas/disciplinas-ofertadas"
import type { DisciplinaOfertadaResponseDto } from "@/api-generated/model/disciplina-ofertada-response-dto"
import { useQueryClient } from "@tanstack/react-query"
import { HeaderIconContainer } from "@/components/icon-container"
import { Loader2, Calendar, PenLine } from "lucide-react"
import type { AxiosError } from "axios"
import { getTurmasControllerFindAllQueryKey } from "@/api-generated/client/turmas/turmas"

// Tipos inferidos dos schemas
type CreateDisciplinaOfertadaFormValues = z.infer<
  typeof disciplinasOfertadasControllerCreateBody
>
type UpdateDisciplinaOfertadaFormValues = z.infer<
  typeof disciplinasOfertadasControllerUpdateBody
>

// Tipo união para o formulário
type DisciplinaOfertadaFormValues =
  | CreateDisciplinaOfertadaFormValues
  | UpdateDisciplinaOfertadaFormValues

// Schemas de validação
const createDisciplinaOfertadaSchema = disciplinasOfertadasControllerCreateBody
const updateDisciplinaOfertadaSchema = disciplinasOfertadasControllerUpdateBody

interface CreateEditDisciplinaOfertadaFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  disciplinaOfertada?: DisciplinaOfertadaResponseDto
}

/**
 * Componente de diálogo para criação/edição de disciplina ofertada
 */
export function CreateEditDisciplinaOfertadaFormDialog({
  isOpen,
  onOpenChange,
  disciplinaOfertada,
}: CreateEditDisciplinaOfertadaFormDialogProps) {
  // Hooks
  const { toast } = useToast()
  const { mutate: mutateCreate, isPending: isLoadingCreate } =
    useDisciplinasOfertadasControllerCreate()
  const { mutate: mutateUpdate, isPending: isLoadingUpdate } =
    useDisciplinasOfertadasControllerUpdate()
  const queryClient = useQueryClient()

  // Busca dados para os selects
  const { data: disciplinas, isLoading: isLoadingDisciplinas } =
    useDisciplinasControllerFindAll()
  const { data: periodosLetivos, isLoading: isLoadingPeriodos } =
    usePeriodosLetivosControllerFindAll()

  // Estados
  const [isEditMode] = useState(!!disciplinaOfertada)
  const isSubmitting = isLoadingCreate || isLoadingUpdate

  // Configuração do formulário
  const form = useForm<DisciplinaOfertadaFormValues>({
    resolver: zodResolver(
      isEditMode ?
        updateDisciplinaOfertadaSchema
      : createDisciplinaOfertadaSchema,
    ),
    defaultValues: {
      idDisciplina: "",
      idPeriodoLetivo: "",
      quantidadeTurmas: 1,
    },
  })

  // Watch dos valores do formulário para preview reativo
  const quantidadeTurmas = form.watch("quantidadeTurmas") || 0
  const disciplinaId = form.watch("idDisciplina")

  // Carrega os dados da disciplina ofertada para edição
  useEffect(() => {
    if (isEditMode && disciplinaOfertada) {
      // Atualiza o formulário com os dados da disciplina ofertada existente
      form.reset({
        idDisciplina: disciplinaOfertada.disciplina?.id || "",
        idPeriodoLetivo: disciplinaOfertada.periodoLetivo?.id || "",
        quantidadeTurmas: disciplinaOfertada.quantidadeTurmas || 1,
      } as DisciplinaOfertadaFormValues)
    } else if (!isEditMode) {
      // Reseta para os valores padrão no modo de criação
      form.reset({
        idDisciplina: "",
        idPeriodoLetivo: "",
        quantidadeTurmas: 1,
      } as DisciplinaOfertadaFormValues)
    }

    // Limpa erros de validação
    form.clearErrors()
  }, [isEditMode, disciplinaOfertada, form])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: DisciplinaOfertadaFormValues) => {
    if (isEditMode && disciplinaOfertada) {
      // Na edição, enviamos apenas os campos fornecidos
      const updateData = data as UpdateDisciplinaOfertadaFormValues

      mutateUpdate(
        {
          id: disciplinaOfertada.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            toast({
              title: "Disciplina ofertada atualizada",
              description: "A disciplina ofertada foi atualizada com sucesso.",
            })
            Promise.all([
              queryClient.invalidateQueries({
                queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
              }),
              queryClient.invalidateQueries({
                queryKey: getTurmasControllerFindAllQueryKey(),
              }),
            ])
            onOpenChange(false)
          },
          onError: (error: AxiosError) => {
            toast({
              title: "Erro ao atualizar disciplina ofertada",
              description:
                error.request.message ||
                "Ocorreu um erro ao atualizar a disciplina ofertada.",
              variant: "destructive",
            })
          },
        },
      )
    } else {
      // No modo de criação
      const createData = data as CreateDisciplinaOfertadaFormValues

      mutateCreate(
        { data: createData },
        {
          onSuccess: () => {
            toast({
              title: "Disciplina ofertada criada",
              description: "A disciplina ofertada foi criada com sucesso.",
            })
            Promise.all([
              queryClient.invalidateQueries({
                queryKey: getDisciplinasOfertadasControllerFindAllQueryKey(),
              }),
              queryClient.invalidateQueries({
                queryKey: getTurmasControllerFindAllQueryKey(),
              }),
            ])
            onOpenChange(false)
          },
          onError: (error: AxiosError) => {
            toast({
              title: "Erro ao criar disciplina ofertada",
              description:
                error.request.message ||
                "Ocorreu um erro ao criar a disciplina ofertada.",
              variant: "destructive",
            })
          },
        },
      )
    }
  }

  // Preview das turmas a serem criadas
  const renderTurmasPreview = () => {
    if (quantidadeTurmas <= 0) return null

    const disciplinaSelecionada = disciplinas?.find((d) => d.id === disciplinaId)

    return (
      <div className="mt-4 rounded-md border p-4">
        <h4 className="text-sm font-medium">
          Preview das turmas que serão criadas:
        </h4>
        <div className="mt-2 space-y-2">
          {Array.from({ length: quantidadeTurmas }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div className="bg-primary/10 rounded-full px-2 py-1 text-xs font-medium">
                Turma {String.fromCharCode(65 + index)}
              </div>
              <span className="text-muted-foreground">
                {disciplinaSelecionada?.nome || "Disciplina selecionada"}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HeaderIconContainer Icon={isEditMode ? PenLine : Calendar} />
            <div className="flex flex-col gap-1">
              <DialogTitle>
                {isEditMode ? "Editar Disciplina Ofertada" : "Ofertar Disciplina"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ?
                  "Edite os campos abaixo para atualizar a disciplina ofertada."
                : "Preencha os campos abaixo para ofertar uma disciplina."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Seleção de Disciplina */}
            <FormField
              control={form.control}
              name="idDisciplina"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disciplina</FormLabel>
                  <Select
                    disabled={isSubmitting || isLoadingDisciplinas}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingDisciplinas ?
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando...</span>
                        </div>
                      : disciplinas && disciplinas.length > 0 ?
                        disciplinas.map((disciplina) => (
                          <SelectItem
                            key={disciplina.id}
                            value={disciplina.id}
                          >
                            <div className="flex flex-col">
                              <span>{disciplina.nome}</span>
                              {disciplina.codigo && (
                                <span className="text-muted-foreground text-xs">
                                  {disciplina.codigo}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      : <div className="px-2 py-2 text-sm">
                          Nenhuma disciplina encontrada
                        </div>
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seleção de Período Letivo */}
            <FormField
              control={form.control}
              name="idPeriodoLetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período Letivo</FormLabel>
                  <Select
                    disabled={isSubmitting || isLoadingPeriodos}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um período letivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPeriodos ?
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando...</span>
                        </div>
                      : periodosLetivos && periodosLetivos.length > 0 ?
                        periodosLetivos.map((periodo) => (
                          <SelectItem
                            key={periodo.id}
                            value={periodo.id}
                          >
                            {periodo.ano}/{periodo.semestre}º Semestre
                          </SelectItem>
                        ))
                      : <div className="px-2 py-2 text-sm">
                          Nenhum período letivo encontrado
                        </div>
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantidade de Turmas */}
            <FormField
              control={form.control}
              name="quantidadeTurmas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Turmas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview das turmas */}
            {renderTurmasPreview()}

            {/* Botões de ação */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ?
                  <>
                    <Loader2 className="animate-spin" />
                    Processando...
                  </>
                : isEditMode ?
                  "Atualizar"
                : "Ofertar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
