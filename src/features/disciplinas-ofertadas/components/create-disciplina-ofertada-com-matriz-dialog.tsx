import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HeaderIconContainer } from "@/components/icon-container"
import { Calendar } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMatrizesCurricularesControllerFindMatrizesDoCoordenador } from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import { usePeriodosLetivosControllerFindPeriodoAtivo } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { useDisciplinasOfertadasControllerCreateComPeriodoAtivo } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import type { MatrizCurricularResponseDto } from "@/api-generated/model/matriz-curricular-response-dto"
import type { DisciplinaResponseDto } from "@/api-generated/model/disciplina-response-dto"
import { useQueryClient } from "@tanstack/react-query"
import { getDisciplinasOfertadasControllerFindOfertasDoCoordenadorQueryKey } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"

import { toast } from "sonner"

// Schema de validação
const createDisciplinaOfertadaSchema = z.object({
  idMatriz: z.string().min(1, "Selecione uma matriz curricular"),
  idDisciplina: z.string().min(1, "Selecione uma disciplina"),
  quantidadeTurmas: z
    .number({
      required_error: "Quantidade de turmas é obrigatória",
      invalid_type_error: "Deve ser um número válido",
    })
    .min(1, "Quantidade de turmas deve ser pelo menos 1")
    .max(10, "Máximo de 10 turmas por disciplina ofertada"),
})

type CreateDisciplinaOfertadaFormValues = z.infer<
  typeof createDisciplinaOfertadaSchema
>

interface CreateDisciplinaOfertadaComMatrizDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Componente de diálogo para criação de disciplina ofertada com filtro por matriz curricular
 */
export function CreateDisciplinaOfertadaComMatrizDialog({
  isOpen,
  onOpenChange,
}: CreateDisciplinaOfertadaComMatrizDialogProps) {
  // Hooks
  const queryClient = useQueryClient()

  // Estados
  const [matrizSelecionada, setMatrizSelecionada] =
    useState<MatrizCurricularResponseDto | null>(null)
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<
    DisciplinaResponseDto[]
  >([])

  // Busca dados da API
  const { data: matrizesCurriculares, isLoading: isLoadingMatrizes } =
    useMatrizesCurricularesControllerFindMatrizesDoCoordenador()
  const { data: periodoAtivo, isLoading: isLoadingPeriodo } =
    usePeriodosLetivosControllerFindPeriodoAtivo()

  // Mutation para criar disciplina ofertada
  const { mutate: criarDisciplinaOfertada, isPending: isCreating } =
    useDisciplinasOfertadasControllerCreateComPeriodoAtivo()

  // Configuração do formulário
  const form = useForm<CreateDisciplinaOfertadaFormValues>({
    resolver: zodResolver(createDisciplinaOfertadaSchema),
    defaultValues: {
      idMatriz: "",
      idDisciplina: "",
      quantidadeTurmas: 1,
    },
  })

  // Watch dos valores do formulário
  const idMatrizWatch = form.watch("idMatriz")
  const idDisciplinaWatch = form.watch("idDisciplina")
  const quantidadeTurmasWatch = form.watch("quantidadeTurmas")

  // Atualiza a matriz selecionada quando o campo muda
  useEffect(() => {
    if (idMatrizWatch && matrizesCurriculares) {
      const matriz = matrizesCurriculares.find((m) => m.id === idMatrizWatch)
      setMatrizSelecionada(matriz || null)

      if (matriz) {
        setDisciplinasDisponiveis(matriz.disciplinas || [])
        // Reset da disciplina selecionada quando a matriz muda
        form.setValue("idDisciplina", "")
      } else {
        setDisciplinasDisponiveis([])
      }
    } else {
      setMatrizSelecionada(null)
      setDisciplinasDisponiveis([])
    }
  }, [idMatrizWatch, matrizesCurriculares, form])

  // Reset do formulário quando o diálogo abre/fecha
  useEffect(() => {
    if (!isOpen) {
      form.reset()
      setMatrizSelecionada(null)
      setDisciplinasDisponiveis([])
    }
  }, [isOpen, form])

  // Busca informações da disciplina selecionada
  const disciplinaSelecionada = disciplinasDisponiveis.find(
    (d) => d.id === idDisciplinaWatch,
  )

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: CreateDisciplinaOfertadaFormValues) => {
    // Garantia extra: validar limite no envio
    if (data.quantidadeTurmas > 10) {
      toast.error("Máximo de 10 turmas por disciplina ofertada")
      return
    }

    criarDisciplinaOfertada(
      {
        data: {
          idDisciplina: data.idDisciplina,
          quantidadeTurmas: data.quantidadeTurmas,
        },
      },
      {
        onSuccess: () => {
          toast.success("Disciplina ofertada criada")

          // Invalida apenas as queries de disciplinas ofertadas
          queryClient.invalidateQueries({
            queryKey:
              getDisciplinasOfertadasControllerFindOfertasDoCoordenadorQueryKey(),
          })

          onOpenChange(false)
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Erro ao criar disciplina ofertada",
          )
        },
      },
    )
  }

  const isLoading = isLoadingMatrizes || isLoadingPeriodo

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <HeaderIconContainer Icon={Calendar} />
            <div>
              <DialogTitle>Nova Oferta de Disciplina</DialogTitle>
              <DialogDescription>
                Selecione uma matriz curricular e disciplina para ofertar no
                período letivo ativo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Informações do Período Letivo Ativo */}
        {periodoAtivo && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3">
            <Calendar className="h-4 w-4 text-green-600" />
            <div>
              <span className="text-sm font-medium text-green-800">
                Período Ativo: {periodoAtivo.ano}/{periodoAtivo.semestre}º
                Semestre
              </span>
              {periodoAtivo.dataFim && (
                <p className="text-xs text-green-600">
                  até {new Date(periodoAtivo.dataFim).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Seleção de Matriz Curricular */}
            <FormField
              control={form.control}
              name="idMatriz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matriz Curricular</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma matriz curricular" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {matrizesCurriculares?.map((matriz) => (
                        <SelectItem
                          key={matriz.id}
                          value={matriz.id}
                        >
                          <div className="flex items-center gap-2">
                            <span>{matriz.nome}</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {matriz.nomeCurso}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seleção de Disciplina */}
            <FormField
              control={form.control}
              name="idDisciplina"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disciplina</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      !matrizSelecionada || disciplinasDisponiveis.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !matrizSelecionada ?
                              "Selecione uma matriz curricular primeiro"
                            : disciplinasDisponiveis.length === 0 ?
                              "Nenhuma disciplina disponível"
                            : "Selecione uma disciplina"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {disciplinasDisponiveis.map((disciplina) => (
                        <SelectItem
                          key={disciplina.id}
                          value={disciplina.id}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{disciplina.nome}</span>
                            {disciplina.codigo && (
                              <span className="text-muted-foreground text-xs">
                                {disciplina.codigo} • {disciplina.cargaHoraria}h
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
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
                      max={10}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        // Limitar o valor entre 1 e 10
                        const limitedValue = Math.min(Math.max(value, 1), 10)
                        field.onChange(limitedValue)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Quantidade máxima de turmas que podem ser criadas para esta
                    disciplina (as turmas devem ser criadas manualmente após
                    salvar)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informação sobre criação manual */}
            {quantidadeTurmasWatch > 0 && disciplinaSelecionada && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <h4 className="mb-1 text-sm font-medium text-blue-800">
                  📋 Próximo passo
                </h4>
                <p className="text-sm text-blue-700">
                  Após criar esta oferta, você poderá criar manualmente{" "}
                  <strong>{quantidadeTurmasWatch} turma(s)</strong> para{" "}
                  <strong>{disciplinaSelecionada.nome}</strong> na página de
                  Turmas.
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-2">
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
                disabled={isCreating || !disciplinaSelecionada}
              >
                {isCreating ? "Criando..." : "Criar Oferta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
