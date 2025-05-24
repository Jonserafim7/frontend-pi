import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HeaderIconContainer } from "@/components/icon-container"
import { GraduationCap, PenSquare, Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  useTurmasControllerCreate,
  useTurmasControllerUpdate,
  useTurmasControllerFindOne,
  getTurmasControllerFindOneQueryKey,
  getTurmasControllerFindAllQueryKey,
} from "@/api-generated/client/turmas/turmas"
import { useDisciplinasOfertadasControllerFindAll } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import type { CreateTurmaDto, UpdateTurmaDto } from "@/api-generated/model"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Schema de validação para o formulário de turma
 */
const turmaFormSchema = z.object({
  idDisciplinaOfertada: z.string().min(1, "Disciplina ofertada é obrigatória"),
  codigoDaTurma: z.string().min(1, "Código da turma é obrigatório"),
})

type TurmaFormData = z.infer<typeof turmaFormSchema>

/**
 * Propriedades do dialog de criação/edição de turma
 */
interface CreateEditTurmaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turmaId?: string
}

/**
 * Dialog para criação e edição de turmas
 */
export function CreateEditTurmaFormDialog({
  open,
  onOpenChange,
  turmaId,
}: CreateEditTurmaFormDialogProps) {
  const isEditing = !!turmaId
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<TurmaFormData>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: {
      idDisciplinaOfertada: "",
      codigoDaTurma: "",
    },
  })

  // Hooks para buscar dados
  const { data: disciplinasOfertadas, isPending: isLoadingDisciplinas } =
    useDisciplinasOfertadasControllerFindAll()

  const { data: turmaData, isPending: isLoadingTurma } =
    useTurmasControllerFindOne(turmaId!, {
      query: {
        enabled: isEditing,
        queryKey: getTurmasControllerFindOneQueryKey(turmaId!),
      },
    })

  // Hooks para mutations
  const { mutate: createTurma } = useTurmasControllerCreate()
  const { mutate: updateTurma } = useTurmasControllerUpdate()

  // Preencher formulário quando editando
  useEffect(() => {
    if (isEditing && turmaData) {
      form.reset({
        idDisciplinaOfertada: turmaData.idDisciplinaOfertada,
        codigoDaTurma: turmaData.codigoDaTurma,
      })
    } else if (!isEditing) {
      form.reset({
        idDisciplinaOfertada: "",
        codigoDaTurma: "",
      })
    }
    form.clearErrors()
  }, [isEditing, turmaData, form])

  const onSubmit = async (data: TurmaFormData) => {
    if (isEditing) {
      const updateData: UpdateTurmaDto = {
        codigoDaTurma: data.codigoDaTurma,
      }
      updateTurma(
        {
          id: turmaId,
          data: updateData,
        },
        {
          onSuccess: () => {
            toast({
              title: "Turma atualizada",
              description: `A turma "${data.codigoDaTurma}" foi atualizada com sucesso.`,
            })
            queryClient.invalidateQueries({
              queryKey: getTurmasControllerFindAllQueryKey(),
            })
            onOpenChange(false)
          },
          onError: (error) => {
            toast({
              title: "Erro ao atualizar turma",
              description:
                error?.message || "Ocorreu um erro ao atualizar a turma.",
              variant: "destructive",
            })
          },
        },
      )
    } else {
      const createData: CreateTurmaDto = {
        idDisciplinaOfertada: data.idDisciplinaOfertada,
        codigoDaTurma: data.codigoDaTurma,
      }
      createTurma(
        { data: createData },
        {
          onSuccess: () => {
            toast({
              title: "Turma criada",
              description: `A turma "${data.codigoDaTurma}" foi criada com sucesso.`,
            })
            queryClient.invalidateQueries({
              queryKey: getTurmasControllerFindAllQueryKey(),
            })
            onOpenChange(false)
          },
          onError: (error) => {
            toast({
              title: "Erro ao criar turma",
              description: error?.message || "Ocorreu um erro ao criar a turma.",
              variant: "destructive",
            })
          },
        },
      )
    }
  }

  const isLoading = isLoadingDisciplinas || (isEditing && isLoadingTurma)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8 sm:max-w-[500px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={isEditing ? PenSquare : GraduationCap} />
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold">
              {isEditing ? "Editar Turma" : "Nova Turma"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ?
                "Edite os dados da turma existente."
              : "Preencha os campos para criar uma nova turma."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ?
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        : <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="idDisciplinaOfertada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disciplina Ofertada</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditing} // Não permitir alterar disciplina ao editar
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma disciplina ofertada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {disciplinasOfertadas?.map((disciplinaOfertada) => (
                          <SelectItem
                            key={disciplinaOfertada.id}
                            value={disciplinaOfertada.id}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {disciplinaOfertada.disciplina.nome}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {disciplinaOfertada.periodoLetivo.ano}/
                                {disciplinaOfertada.periodoLetivo.semestre}º
                                semestre
                                {disciplinaOfertada.disciplina.codigo &&
                                  ` • ${disciplinaOfertada.disciplina.codigo}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoDaTurma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código da Turma</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: T1, T2, A, B"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ?
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Salvando..." : "Criando..."}
                    </>
                  : isEditing ?
                    "Salvar"
                  : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        }
      </DialogContent>
    </Dialog>
  )
}
