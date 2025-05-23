import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Loader2, User, Clock, BookOpen } from "lucide-react"
import { useAtribuirProfessor } from "../hooks/use-turmas"
import { useUsuariosControllerFindAll } from "@/api-generated/client/usuarios/usuarios"
import type { TurmaResponseDto } from "@/api-generated/model"

/**
 * Schema de validação para atribuição de professor
 */
const atribuirProfessorSchema = z.object({
  idUsuarioProfessor: z.string().min(1, "Professor é obrigatório"),
})

type AtribuirProfessorFormData = z.infer<typeof atribuirProfessorSchema>

interface AtribuirProfessorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turma: TurmaResponseDto | null
  onSuccess?: () => void
}

/**
 * Modal para atribuir professor à turma
 */
export function AtribuirProfessorModal({
  open,
  onOpenChange,
  turma,
  onSuccess,
}: AtribuirProfessorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Buscar professores disponíveis
  const { data: usuarios } = useUsuariosControllerFindAll({
    papel: "PROFESSOR",
  })

  // Hook para atribuir professor
  const atribuirProfessorMutation = useAtribuirProfessor()

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

    try {
      setIsSubmitting(true)

      await atribuirProfessorMutation.mutateAsync({
        id: turma.id,
        data: {
          idUsuarioProfessor: data.idUsuarioProfessor,
        },
      })

      // Resetar form e fechar modal
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao atribuir professor:", error)
    } finally {
      setIsSubmitting(false)
    }
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
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
        </DialogHeader>

        {/* Informações da Turma */}
        {turma?.disciplinaOfertada && (
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">
                    {turma.disciplinaOfertada.disciplina?.nome}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3" />
                  {turma.disciplinaOfertada.periodoLetivo?.ano}/
                  {turma.disciplinaOfertada.periodoLetivo?.semestre}º Semestre
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline">{turma.codigoDaTurma}</Badge>
                {turma.disciplinaOfertada.disciplina?.codigo && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {turma.disciplinaOfertada.disciplina.codigo}
                  </Badge>
                )}
              </div>
            </div>
            {turma.disciplinaOfertada.disciplina?.cargaHoraria && (
              <div className="text-muted-foreground mt-2 text-sm">
                Carga Horária: {turma.disciplinaOfertada.disciplina.cargaHoraria}h
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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
                      <SelectTrigger>
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
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {professor.nome}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {professor.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informações adicionais */}
            <div className="rounded-md bg-blue-50 p-3 text-sm">
              <div className="mb-1 font-medium text-blue-900">💡 Dica</div>
              <div className="text-blue-700">
                Certifique-se de que o professor tem disponibilidade para este
                período antes de fazer a atribuição.
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || professores.length === 0}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Atribuir Professor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
