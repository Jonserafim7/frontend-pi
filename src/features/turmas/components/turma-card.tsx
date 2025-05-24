import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, UserPlus, UserMinus, Trash2 } from "lucide-react"
import type { TurmaResponseDto } from "@/api-generated/model"

interface TurmaCardProps {
  turma: TurmaResponseDto
  onEdit?: (turma: TurmaResponseDto) => void
  onAtribuirProfessor?: (turma: TurmaResponseDto) => void
  onRemoverProfessor?: (turma: TurmaResponseDto) => void
  onDelete?: (turma: TurmaResponseDto) => void
  showActions?: boolean
}

/**
 * Card para exibir informações de uma turma
 */
export function TurmaCard({
  turma,
  onEdit,
  onAtribuirProfessor,
  onRemoverProfessor,
  onDelete,
  showActions = true,
}: TurmaCardProps) {
  // Temporariamente assumindo que não temos professor até atualizar o DTO
  const hasProfesor = false

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">
            {turma.disciplinaOfertada?.disciplina?.nome}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs"
            >
              {turma.codigoDaTurma}
            </Badge>
            {turma.disciplinaOfertada?.disciplina?.codigo && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {turma.disciplinaOfertada.disciplina.codigo}
              </Badge>
            )}
          </div>
        </div>
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(turma)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {!hasProfesor && onAtribuirProfessor && (
                <DropdownMenuItem onClick={() => onAtribuirProfessor(turma)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Atribuir Professor
                </DropdownMenuItem>
              )}
              {hasProfesor && onRemoverProfessor && (
                <DropdownMenuItem onClick={() => onRemoverProfessor(turma)}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remover Professor
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(turma)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Período Letivo */}
        <div className="text-sm">
          <span className="text-muted-foreground font-medium">Período:</span>
          <span className="ml-2">
            {turma.disciplinaOfertada?.periodoLetivo?.ano}/
            {turma.disciplinaOfertada?.periodoLetivo?.semestre}º Semestre
          </span>
        </div>

        {/* Professor Alocado - por enquanto mostra sempre não atribuído */}
        <div className="text-sm">
          <span className="text-muted-foreground font-medium">Professor:</span>
          <span className="text-muted-foreground ml-2">
            {turma.professorAlocado?.nome}
          </span>
        </div>

        {/* Carga Horária */}
        {turma.disciplinaOfertada?.disciplina?.cargaHoraria && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">
              Carga Horária:
            </span>
            <span className="ml-2">
              {turma.disciplinaOfertada.disciplina.cargaHoraria}h
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={hasProfesor ? "default" : "secondary"}
            className="text-xs"
          >
            {hasProfesor ? "Com Professor" : "Aguardando Professor"}
          </Badge>

          <div className="text-muted-foreground text-xs">
            Criada em {new Date(turma.dataCriacao).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
