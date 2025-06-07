import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

interface TurmasStatisticsProps {
  total: number
  totalNaoAlocadas: number
  totalParcialmenteAlocadas: number
  totalTotalmenteAlocadas: number
  isLoading?: boolean
}

export function TurmasStatistics({
  total,
  totalNaoAlocadas,
  totalParcialmenteAlocadas,
  totalTotalmenteAlocadas,
  isLoading = false,
}: TurmasStatisticsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-medium">Total de Turmas</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">{total}</span>
            {isLoading && (
              <span className="text-muted-foreground ml-2 text-sm">
                Carregando...
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span className="text-sm font-medium">Não Alocadas</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">{totalNaoAlocadas}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="text-sm font-medium">Parcialmente Alocadas</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              {totalParcialmenteAlocadas}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="text-sm font-medium">Totalmente Alocadas</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">{totalTotalmenteAlocadas}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
