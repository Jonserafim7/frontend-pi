import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, User, BookOpen, Clock } from "lucide-react"
import { useDndAlocacao } from "./dnd-provider"
import { type AlocacaoDisplay } from "../types"

interface AlocacaoCardProps {
  alocacao: AlocacaoDisplay
}

export function AlocacaoCard({ alocacao }: AlocacaoCardProps) {
  const { handleRemoveAlocacao, isLoading } = useDndAlocacao()

  const handleRemove = async () => {
    if (window.confirm("Tem certeza que deseja remover esta alocação?")) {
      await handleRemoveAlocacao(alocacao.id)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">
                {alocacao.turma.codigo}
              </span>
              <Badge
                variant="outline"
                className="text-xs"
              >
                {alocacao.diaDaSemana}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{alocacao.turma.disciplina}</p>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{alocacao.turma.professor}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {alocacao.horaInicio} - {alocacao.horaFim}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
