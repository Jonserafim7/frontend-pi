import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"
import { HeaderIconContainer } from "@/components/icon-container"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, BookOpen, Clock, Lightbulb } from "lucide-react"
import {
  useTurmasControllerAtribuirProfessor,
  getTurmasControllerFindAllQueryKey,
} from "@/api-generated/client/turmas/turmas"
import { useUsuariosControllerFindAll } from "@/api-generated/client/usuarios/usuarios"
import type { TurmaResponseDto } from "@/api-generated/model"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Schema de validação para atribuição de professor
 */
const atribuirProfessorSchema = z.object({
  idUsuarioProfessor: z.string().min(1, "Professor é obrigatório"),
})

type AtribuirProfessorFormData = z.infer<typeof atribuirProfessorSchema>

interface AtribuirProfessorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turma: TurmaResponseDto | null
  onSuccess?: () => void
}

/**
 * Dialog para atribuir professor à turma
 */
export function AtribuirProfessorDialog({
  open,
  onOpenChange,
  turma,
  onSuccess,
}: AtribuirProfessorDialogProps) {
  const queryClient = useQueryClient()

  // Buscar professores disponíveis
  const { data: usuarios } = useUsuariosControllerFindAll({
    papel: "PROFESSOR",
  })

  // Hook para atribuir professor
  const { mutate: atribuirProfessor } = useTurmasControllerAtribuirProfessor()

  // Configurar form com React Hook Form + Zod
  const form = useForm<AtribuirProfessorFormData>({
    resolver: zodResolver(atribuirProfessorSchema),
    defaultValues: {
      idUsuarioProfessor: "",
    },
  })

  /**
   * Handler para envio do formulário
   */
  const onSubmit = async (data: AtribuirProfessorFormData) => {
    if (!turma) return

    atribuirProfessor(
      {
        id: turma.id,
        data: {
          idUsuarioProfessor: data.idUsuarioProfessor,
        },
      },
      {
        onSuccess: () => {
          const professor = professores.find(
            (p) => p.id === data.idUsuarioProfessor,
          )
          toast.success(
            `O professor ${professor?.nome} foi atribuído à turma ${turma.codigoDaTurma} com sucesso.`,
          )
          queryClient.invalidateQueries({
            queryKey: getTurmasControllerFindAllQueryKey(),
          })
          form.reset()
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Erro ao atribuir professor",
          )
        },
      },
    )
  }

  /**
   * Handler para fechar modal
   */
  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  // Filtrar apenas professores
  const professores = usuarios?.filter((user) => user.papel === "PROFESSOR") || []

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="gap-6 sm:max-w-[600px]">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={UserPlus} />
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold">
              Atribuir Professor
            </DialogTitle>
            <DialogDescription>
              Selecione um professor para a turma{" "}
              <strong>{turma?.codigoDaTurma}</strong>
              {turma?.disciplinaOfertada?.disciplina?.nome && (
                <> de {turma.disciplinaOfertada.disciplina.nome}</>
              )}
              .
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Informações da Turma */}
        {turma && (
          <div className="bg-muted/20 dark:bg-muted/10 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">
                    {turma.disciplinaOfertada?.disciplina?.nome ||
                      "Disciplina não informada"}
                  </span>
                </div>
                {turma.disciplinaOfertada?.periodoLetivo && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>
                      {turma.disciplinaOfertada.periodoLetivo.ano}/
                      {turma.disciplinaOfertada.periodoLetivo.semestre}º Semestre
                    </span>
                  </div>
                )}
                {turma.disciplinaOfertada?.disciplina?.cargaHoraria && (
                  <div className="text-muted-foreground text-sm">
                    Carga Horária:{" "}
                    {turma.disciplinaOfertada.disciplina.cargaHoraria}h
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline">{turma.codigoDaTurma}</Badge>
                {turma.disciplinaOfertada?.disciplina?.codigo && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {turma.disciplinaOfertada.disciplina.codigo}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Seleção de Professor */}
            <FormField
              control={form.control}
              name="idUsuarioProfessor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professores.length === 0 ?
                        <div className="text-muted-foreground p-4 text-center text-sm">
                          Nenhum professor encontrado
                        </div>
                      : professores.map((professor) => (
                          <SelectItem
                            key={professor.id}
                            value={professor.id}
                          >
                            {professor.nome}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dica seguindo o design system */}
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Certifique-se de que o professor tem disponibilidade para este
                período antes de fazer a atribuição.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || professores.length === 0}
              >
                {form.formState.isSubmitting ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atribuindo...
                  </>
                : "Atribuir Professor"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
