import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock, Edit, MoreVertical, Trash2 } from "lucide-react"
import {
  DIAS_SEMANA_LABELS,
  STATUS_DISPONIBILIDADE_LABELS,
} from "../schemas/disponibilidade-schemas"
import type {
  DiaSemana,
  StatusDisponibilidade,
} from "../schemas/disponibilidade-schemas"

/**
 * Interface representando uma disponibilidade
 */
interface Disponibilidade {
  id: string
  diaDaSemana: DiaSemana
  horaInicio: string
  horaFim: string
  status: StatusDisponibilidade
  professor?: {
    id: string
    nome: string
  }
  periodoLetivo?: {
    id: string
    nome: string
  }
  dataCriacao: Date
  dataAtualizacao: Date
}

/**
 * Propriedades do componente DisponibilidadeCard
 */
interface DisponibilidadeCardProps {
  /** Dados da disponibilidade */
  disponibilidade: Disponibilidade
  /** Callback para editar */
  onEdit?: (disponibilidade: Disponibilidade) => void
  /** Callback para excluir */
  onDelete?: (id: string) => void
  /** Se está carregando operação */
  isLoading?: boolean
  /** Se deve mostrar informações do professor */
  showProfessor?: boolean
  /** Se deve mostrar informações do período */
  showPeriodo?: boolean
}

/**
 * Componente para exibir card de disponibilidade
 */
export function DisponibilidadeCard({
  disponibilidade,
  onEdit,
  onDelete,
  isLoading = false,
  showProfessor = false,
  showPeriodo = false,
}: DisponibilidadeCardProps) {
  const {
    id,
    diaDaSemana,
    horaInicio,
    horaFim,
    status,
    professor,
    periodoLetivo,
  } = disponibilidade

  const diaLabel = DIAS_SEMANA_LABELS[diaDaSemana]
  const statusLabel = STATUS_DISPONIBILIDADE_LABELS[status]

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{diaLabel}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {horaInicio} - {horaFim}
            </CardDescription>
          </div>

          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(disponibilidade)}
                    disabled={isLoading}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(id)}
                    disabled={isLoading}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status Badge */}
          <div>
            <Badge
              variant={status === "DISPONIVEL" ? "default" : "secondary"}
              className={
                status === "DISPONIVEL" ?
                  "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {statusLabel}
            </Badge>
          </div>

          {/* Informações do Professor */}
          {showProfessor && professor && (
            <div className="text-muted-foreground text-sm">
              <span className="font-medium">Professor:</span> {professor.nome}
            </div>
          )}

          {/* Informações do Período */}
          {showPeriodo && periodoLetivo && (
            <div className="text-muted-foreground text-sm">
              <span className="font-medium">Período:</span> {periodoLetivo.nome}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
