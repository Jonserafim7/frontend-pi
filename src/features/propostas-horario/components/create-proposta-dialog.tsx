import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CalendarDays, Loader2, Plus } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { toast } from "sonner"

import { useCursosControllerFindAll } from "@/api-generated/client/cursos/cursos"
import { usePeriodosLetivosControllerFindAll } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import {
  createPropostaFormSchema,
  type CreatePropostaFormData,
} from "../schemas/proposta-schemas"
import { useCreateProposta } from "../hooks/use-propostas-horario"

interface CreatePropostaDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog para criação de nova proposta de horário
 * Permite seleção de curso, período letivo e observações
 */
export function CreatePropostaDialog({
  isOpen,
  onOpenChange,
}: CreatePropostaDialogProps) {
  const navigate = useNavigate()

  // Hooks da API
  const { mutate: createProposta, isPending: isCreating } = useCreateProposta()

  const { data: cursos = [], isLoading: isLoadingCursos } =
    useCursosControllerFindAll()

  const { data: periodosLetivos = [], isLoading: isLoadingPeriodos } =
    usePeriodosLetivosControllerFindAll()

  // Configuração do formulário
  const form = useForm<CreatePropostaFormData>({
    resolver: zodResolver(createPropostaFormSchema),
    defaultValues: {
      idCurso: "",
      idPeriodoLetivo: "",
      observacoesCoordenador: "",
    },
  })

  // Reset do formulário quando o dialog abre/fecha
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: CreatePropostaFormData) => {
    createProposta(
      { data },
      {
        onSuccess: (proposta) => {
          toast.success("Proposta criada com sucesso!")
          onOpenChange(false)
          // Redireciona para a página de edição da proposta criada
          navigate(`/coordenador/propostas-horario/${proposta.id}`)
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "Erro ao criar proposta"
          toast.error(errorMessage)
        },
      },
    )
  }

  // Filtra apenas períodos letivos ativos
  const periodosAtivos = periodosLetivos.filter(
    (periodo) => periodo.status === "ATIVO",
  )

  // Ordena cursos por nome
  const cursosOrdenados = [...cursos].sort((a, b) => a.nome.localeCompare(b.nome))

  // Ordena períodos por ano e semestre (mais recentes primeiro)
  const periodosOrdenados = [...periodosAtivos].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano
    return b.semestre - a.semestre
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8 sm:max-w-[500px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={Plus} />
          <div>
            <DialogTitle className="text-2xl font-bold">
              Nova Proposta de Horário
            </DialogTitle>
            <DialogDescription>
              Crie uma nova proposta de grade horária selecionando o curso e
              período letivo.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Seleção de Curso */}
            <FormField
              control={form.control}
              name="idCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCursos || isCreating}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um curso..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCursos ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando cursos...
                          </div>
                        </SelectItem>
                      : cursosOrdenados.length === 0 ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          Nenhum curso encontrado
                        </SelectItem>
                      : cursosOrdenados.map((curso) => (
                          <SelectItem
                            key={curso.id}
                            value={curso.id}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{curso.nome}</span>
                              {curso.codigo && (
                                <span className="text-muted-foreground text-xs">
                                  {curso.codigo}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o curso para o qual deseja criar a proposta de
                    horário.
                  </FormDescription>
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
                  <FormLabel>Período Letivo *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPeriodos || isCreating}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um período letivo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPeriodos ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando períodos...
                          </div>
                        </SelectItem>
                      : periodosOrdenados.length === 0 ?
                        <SelectItem
                          value=""
                          disabled
                        >
                          Nenhum período ativo encontrado
                        </SelectItem>
                      : periodosOrdenados.map((periodo) => (
                          <SelectItem
                            key={periodo.id}
                            value={periodo.id}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {periodo.ano}/{periodo.semestre}º Semestre
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {new Date(periodo.dataInicio).toLocaleDateString(
                                  "pt-BR",
                                )}{" "}
                                -{" "}
                                {new Date(periodo.dataFim).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o período letivo para o qual a proposta será criada.
                    Apenas períodos ativos são exibidos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações do Coordenador */}
            <FormField
              control={form.control}
              name="observacoesCoordenador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre esta proposta (opcional)..."
                      className="min-h-[100px] resize-none"
                      disabled={isCreating}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Campo opcional para adicionar observações sobre a proposta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                : <>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Criar Proposta
                  </>
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
