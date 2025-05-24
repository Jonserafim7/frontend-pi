import { useState, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"
import { useCreateTurma, useTurmas } from "../hooks/use-turmas"
import { useDisciplinasOfertadasControllerFindAll } from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"

/**
 * Schema de validação para criação de turma
 */
const createTurmaSchema = z.object({
  codigoDaTurma: z
    .string()
    .min(1, "Código da turma é obrigatório")
    .max(10, "Código deve ter no máximo 10 caracteres"),
  idDisciplinaOfertada: z.string().min(1, "Disciplina ofertada é obrigatória"),
})

type CreateTurmaFormData = z.infer<typeof createTurmaSchema>

interface CreateTurmaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Modal para criação de nova turma
 */
export function CreateTurmaModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTurmaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Buscar disciplinas ofertadas para o select
  const { data: disciplinasOfertadas } =
    useDisciplinasOfertadasControllerFindAll()

  // Buscar todas as turmas para calcular disponibilidade
  const { data: todasTurmas } = useTurmas()

  // Hook para criar turma
  const createTurmaMutation = useCreateTurma()

  // Configurar form com React Hook Form + Zod
  const form = useForm<CreateTurmaFormData>({
    resolver: zodResolver(createTurmaSchema),
    defaultValues: {
      codigoDaTurma: "",
      idDisciplinaOfertada: "",
    },
  })

  /**
   * Calcula ofertas disponíveis (que ainda têm vagas para turmas)
   */
  const ofertasDisponibles = useMemo(() => {
    if (!disciplinasOfertadas || !todasTurmas) return []

    return disciplinasOfertadas
      .map((oferta) => {
        // Contar turmas existentes para esta oferta
        const turmasExistentes = todasTurmas.filter(
          (turma) => turma.idDisciplinaOfertada === oferta.id,
        ).length

        return {
          ...oferta,
          turmasExistentes,
          vagasDisponiveis: oferta.quantidadeTurmas - turmasExistentes,
          temVagas: turmasExistentes < oferta.quantidadeTurmas,
        }
      })
      .filter((oferta) => oferta.temVagas) // Apenas ofertas com vagas
      .sort((a, b) => {
        // Ordenar por disciplina
        const nomeA = a.disciplina?.nome || ""
        const nomeB = b.disciplina?.nome || ""
        return nomeA.localeCompare(nomeB)
      })
  }, [disciplinasOfertadas, todasTurmas])

  /**
   * Handler para envio do formulário
   */
  const onSubmit = async (data: CreateTurmaFormData) => {
    try {
      setIsSubmitting(true)

      await createTurmaMutation.mutateAsync({
        data: {
          codigoDaTurma: data.codigoDaTurma,
          idDisciplinaOfertada: data.idDisciplinaOfertada,
        },
      })

      // Resetar form e fechar modal
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao criar turma:", error)
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

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
          <DialogDescription>
            Crie uma nova turma para uma disciplina ofertada.
            {ofertasDisponibles.length === 0 && disciplinasOfertadas && (
              <span className="mt-2 flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Todas as disciplinas ofertadas já atingiram o limite de turmas.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Disciplina Ofertada */}
            <FormField
              control={form.control}
              name="idDisciplinaOfertada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disciplina Ofertada</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={ofertasDisponibles.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            ofertasDisponibles.length === 0 ?
                              "Nenhuma disciplina com vagas disponíveis"
                            : "Selecione uma disciplina ofertada"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ofertasDisponibles.map((oferta) => (
                        <SelectItem
                          key={oferta.id}
                          value={oferta.id}
                        >
                          <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {oferta.disciplina?.nome}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                {oferta.vagasDisponiveis} vaga(s)
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {oferta.periodoLetivo?.ano}/
                              {oferta.periodoLetivo?.semestre}º Semestre
                              {oferta.disciplina?.codigo &&
                                ` • ${oferta.disciplina.codigo}`}
                              {" • "}
                              {oferta.turmasExistentes}/{oferta.quantidadeTurmas}{" "}
                              turmas
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

            {/* Código da Turma */}
            <FormField
              control={form.control}
              name="codigoDaTurma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código da Turma</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: T1, T2, A, B..."
                      {...field}
                      disabled={isSubmitting || ofertasDisponibles.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isSubmitting || ofertasDisponibles.length === 0}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Turma
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
