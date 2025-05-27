import { Card } from "@/components/ui/card"
import { useDndAlocacao } from "./dnd-provider"

export function MetricsPanel() {
  const { turmas } = useDndAlocacao()

  const turmasCompletas = turmas.filter((t) => t.status === "completa").length
  const turmasParciais = turmas.filter((t) => t.status === "parcial").length
  const turmasNaoAlocadas = turmas.filter((t) => t.status === "nao-alocada").length
  const turmasSemProfessor = turmas.filter((t) => t.status === "sem-professor").length

  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-3"> Métricas em Tempo Real</h3>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Card className="p-2">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{turmasCompletas}</div>
            <div className="text-muted-foreground"> Completas</div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{turmasParciais}</div>
            <div className="text-muted-foreground"> Parciais</div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{turmasNaoAlocadas}</div>
            <div className="text-muted-foreground"> Não Alocadas</div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{turmasSemProfessor}</div>
            <div className="text-muted-foreground"> Sem Prof.</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
