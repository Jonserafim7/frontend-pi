import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"
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
  useDisciplinasOfertadasControllerUpdate,
  getDisciplinasOfertadasControllerFindOfertasDoCoordenadorQueryKey,
} from "@/api-generated/client/disciplinas-ofertadas/disciplinas-ofertadas"
import { disciplinasOfertadasControllerUpdateBody } from "@/api-generated/zod-schemas/disciplinas-ofertadas/disciplinas-ofertadas"
import type { DisciplinaOfertadaResponseDto } from "@/api-generated/model/disciplina-ofertada-response-dto"
import { useQueryClient } from "@tanstack/react-query"
import { HeaderIconContainer } from "@/components/icon-container"
import { Loader2, PenLine } from "lucide-react"
import type { AxiosError } from "axios"
import { getTurmasControllerFindAllQueryKey } from "@/api-generated/client/turmas/turmas"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// Tipo do formulário
type EditDisciplinaOfertadaFormValues = z.infer<
  typeof disciplinasOfertadasControllerUpdateBody
>

// Schema de validação
const editDisciplinaOfertadaSchema = disciplinasOfertadasControllerUpdateBody

interface EditDisciplinaOfertadaDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  disciplinaOfertada: DisciplinaOfertadaResponseDto
}

/**
 * Componente de diálogo específico para edição de disciplina ofertada
 * Permite apenas editar a quantidade de turmas (disciplina e período são fixos)
 */
export function EditDisciplinaOfertadaDialog({
  isOpen,
  onOpenChange,
  disciplinaOfertada,
}: EditDisciplinaOfertadaDialogProps) {
  // Hooks
  const { mutate: mutateUpdate, isPending: isLoading } =
    useDisciplinasOfertadasControllerUpdate()
  const queryClient = useQueryClient()

  // Configuração do formulário
  const form = useForm<EditDisciplinaOfertadaFormValues>({
    resolver: zodResolver(editDisciplinaOfertadaSchema),
    defaultValues: {
      quantidadeTurmas: disciplinaOfertada.quantidadeTurmas,
    },
  })

  // Watch do valor para preview
  const quantidadeTurmas = form.watch("quantidadeTurmas") || 0

  // Carrega os dados da disciplina ofertada
  useEffect(() => {
    if (disciplinaOfertada) {
      form.reset({
        quantidadeTurmas: disciplinaOfertada.quantidadeTurmas,
      })
    }
  }, [disciplinaOfertada, form])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: EditDisciplinaOfertadaFormValues) => {
    mutateUpdate(
      {
        id: disciplinaOfertada.id,
        data: {
          quantidadeTurmas: data.quantidadeTurmas,
        },
      },
      {
        onSuccess: () => {
          toast.success("Disciplina ofertada atualizada")
          Promise.all([
            queryClient.invalidateQueries({
              queryKey:
                getDisciplinasOfertadasControllerFindOfertasDoCoordenadorQueryKey(),
            }),
            queryClient.invalidateQueries({
              queryKey: getTurmasControllerFindAllQueryKey(),
            }),
          ])
          onOpenChange(false)
        },
        onError: (error: AxiosError) => {
          toast.error(
            error.message ||
              "Ocorreu um erro ao atualizar a disciplina ofertada.",
          )
        },
      },
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
            <HeaderIconContainer Icon={PenLine} />
            <div className="flex flex-col gap-1">
              <DialogTitle>Editar Disciplina Ofertada</DialogTitle>
              <DialogDescription>
                Altere a quantidade de turmas da disciplina ofertada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Informações da disciplina (apenas leitura) */}
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Disciplina</span>
            <div className="flex items-center gap-2">
              <span>{disciplinaOfertada.disciplina?.nome}</span>
              {disciplinaOfertada.disciplina?.codigo && (
                <Badge variant="outline">
                  {disciplinaOfertada.disciplina.codigo}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Período Letivo</span>
            <span>
              {disciplinaOfertada.periodoLetivo?.ano}/
              {disciplinaOfertada.periodoLetivo?.semestre}º Semestre
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
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
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview das turmas */}
            {quantidadeTurmas > 0 && (
              <div className="rounded-md border p-4">
                <h4 className="mb-2 text-sm font-medium">Preview das turmas:</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: quantidadeTurmas }).map((_, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs"
                    >
                      Turma {String.fromCharCode(65 + index)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                : "Atualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
