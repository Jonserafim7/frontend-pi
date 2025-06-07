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
import { XCircle } from "lucide-react"
import type { PropostaHorarioResponseDto } from "@/api-generated/model"

interface RejectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposta: PropostaHorarioResponseDto | null
  onConfirm: (justificativa: string, observacoes: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Modal reutilizável para rejeição de propostas com validação de campos obrigatórios
 */
export function RejectModal({
  open,
  onOpenChange,
  proposta,
  onConfirm,
  isLoading = false,
}: RejectModalProps) {
  const [justificativa, setJustificativa] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [justificativaError, setJustificativaError] = useState("")
  const [observacoesError, setObservacoesError] = useState("")

  // Validação de justificativa
  const validateJustificativa = useCallback((value: string): string => {
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) {
      return "Justificativa é obrigatória para rejeitar uma proposta"
    }
    if (trimmedValue.length < 10) {
      return "Justificativa deve ter pelo menos 10 caracteres"
    }
    if (trimmedValue.length > 500) {
      return "Justificativa não pode exceder 500 caracteres"
    }
    return ""
  }, [])

  // Validação de observações
  const validateObservacoes = useCallback((value: string): string => {
    if (value.length > 300) {
      return "Observações não podem exceder 300 caracteres"
    }
    return ""
  }, [])

  // Handler para mudança de justificativa com validação em tempo real
  const handleJustificativaChange = useCallback(
    (value: string) => {
      setJustificativa(value)
      const error = validateJustificativa(value)
      setJustificativaError(error)
    },
    [validateJustificativa],
  )

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
    const justificativaValidationError = validateJustificativa(justificativa)
    const observacoesValidationError = validateObservacoes(observacoes)

    if (justificativaValidationError) {
      setJustificativaError(justificativaValidationError)
      return
    }

    if (observacoesValidationError) {
      setObservacoesError(observacoesValidationError)
      return
    }

    try {
      await onConfirm(justificativa.trim(), observacoes.trim())
      // Limpar estado após sucesso
      setJustificativa("")
      setObservacoes("")
      setJustificativaError("")
      setObservacoesError("")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao rejeitar proposta:", error)
    }
  }, [
    justificativa,
    observacoes,
    validateJustificativa,
    validateObservacoes,
    onConfirm,
    onOpenChange,
  ])

  // Handler para cancelamento
  const handleCancel = useCallback(() => {
    setJustificativa("")
    setObservacoes("")
    setJustificativaError("")
    setObservacoesError("")
    onOpenChange(false)
  }, [onOpenChange])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setJustificativa("")
      setObservacoes("")
      setJustificativaError("")
      setObservacoesError("")
    }
  }, [open])

  // Verificar se formulário é válido
  const isFormValid =
    !justificativaError && !observacoesError && justificativa.trim().length >= 10

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Rejeitar Proposta
          </DialogTitle>
          <DialogDescription>
            {proposta ?
              <>
                Rejeitar a proposta de horário do curso{" "}
                <span className="font-medium">{proposta.curso.nome}</span> para o
                período {proposta.periodoLetivo.ano}/
                {proposta.periodoLetivo.semestre}?
              </>
            : "Rejeitar proposta de horário?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo de justificativa obrigatório */}
          <div className="space-y-2">
            <Label htmlFor="justificativa-rejeitar">
              Justificativa da rejeição *
            </Label>
            <Textarea
              id="justificativa-rejeitar"
              placeholder="Explique o motivo da rejeição (mínimo 10 caracteres)..."
              value={justificativa}
              onChange={(e) => handleJustificativaChange(e.target.value)}
              className={justificativaError ? "border-red-500" : ""}
              maxLength={500}
              required
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              {justificativaError ?
                <span className="text-red-500">{justificativaError}</span>
              : <span />}
              <span>{justificativa.length}/500</span>
            </div>
          </div>

          {/* Campo de observações opcionais */}
          <div className="space-y-2">
            <Label htmlFor="observacoes-rejeitar">Observações (opcional)</Label>
            <Textarea
              id="observacoes-rejeitar"
              placeholder="Adicione observações adicionais..."
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
            disabled={isLoading || !isFormValid}
            variant="destructive"
          >
            {isLoading ? "Rejeitando..." : "Rejeitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
