import { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"

interface ApproveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposta: PropostaHorarioResponseDto | null
  onConfirm: (observacoes: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Modal reutilizável para aprovação de propostas com validação de observações
 */
export function ApproveModal({
  open,
  onOpenChange,
  proposta,
  onConfirm,
  isLoading = false,
}: ApproveModalProps) {
  const [observacoes, setObservacoes] = useState("")
  const [observacoesError, setObservacoesError] = useState("")

  // Validação de observações
  const validateObservacoes = useCallback((value: string): string => {
    if (value.length > 300) {
      return "Observações não podem exceder 300 caracteres"
    }
    return ""
  }, [])

  // Handler para mudança de observações com validação em tempo real
  const handleObservacoesChange = useCallback(
    (value: string) => {
      setObservacoes(value)
      const error = validateObservacoes(value)
      setObservacoesError(error)
    },
    [validateObservacoes],
  )

  // Handler para confirmação com validação
  const handleConfirm = useCallback(async () => {
    const error = validateObservacoes(observacoes)
    if (error) {
      setObservacoesError(error)
      return
    }

    try {
      await onConfirm(observacoes.trim())
      // Limpar estado após sucesso
      setObservacoes("")
      setObservacoesError("")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao aprovar proposta:", error)
    }
  }, [observacoes, validateObservacoes, onConfirm, onOpenChange])

  // Handler para cancelamento
  const handleCancel = useCallback(() => {
    setObservacoes("")
    setObservacoesError("")
    onOpenChange(false)
  }, [onOpenChange])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setObservacoes("")
      setObservacoesError("")
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Aprovar Proposta
          </DialogTitle>
          <DialogDescription>
            {proposta ?
              <>
                Aprovar a proposta de horário do curso{" "}
                <span className="font-medium">{proposta.curso.nome}</span> para o
                período {proposta.periodoLetivo.ano}/
                {proposta.periodoLetivo.semestre}?
              </>
            : "Aprovar proposta de horário?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="observacoes-aprovar">Observações (opcional)</Label>
            <Textarea
              id="observacoes-aprovar"
              placeholder="Adicione observações sobre a aprovação..."
              value={observacoes}
              onChange={(e) => handleObservacoesChange(e.target.value)}
              className={observacoesError ? "border-red-500" : ""}
              maxLength={300}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              {observacoesError ?
                <span className="text-red-500">{observacoesError}</span>
              : <span />}
              <span>{observacoes.length}/300</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !!observacoesError}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Aprovando..." : "Aprovar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
