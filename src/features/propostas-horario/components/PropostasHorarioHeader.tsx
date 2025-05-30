import { Button } from "@/components/ui/button"
import { CalendarIcon, RefreshCw, Save } from "lucide-react"

interface PropostasHorarioHeaderProps {
  onRefresh?: () => void
  onSave?: () => void
}

export function PropostasHorarioHeader({
  onRefresh,
  onSave,
}: PropostasHorarioHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <CalendarIcon className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Propostas de Horário</h1>
          <p className="text-muted-foreground">
            Gerencie a alocação de turmas nos horários
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
        <Button
          size="sm"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Salvar Proposta
        </Button>
      </div>
    </div>
  )
}
