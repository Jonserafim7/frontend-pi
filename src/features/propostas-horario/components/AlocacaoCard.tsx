import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Clock, User, BookOpen, Hash } from "lucide-react"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"
import { cn } from "@/lib/utils"

export interface AlocacaoCardProps {
  /** Dados da alocação a ser exibida */
  alocacao: AlocacaoHorarioResponseDto
  /** Callback executado quando o card é clicado */
  onClick?: (alocacao: AlocacaoHorarioResponseDto) => void
  /** Se o card está selecionado */
  isSelected?: boolean
  /** Classes CSS adicionais */
  className?: string
  /** Tamanho do card */
  size?: "sm" | "md" | "lg"
  /** Se deve mostrar informações detalhadas */
  showDetails?: boolean
}

/**
 * Componente para exibir uma alocação de horário em formato de card
 *
 * @param props - Propriedades do componente
 * @returns JSX do card de alocação
 */
export const AlocacaoCard: React.FC<AlocacaoCardProps> = ({
  alocacao,
  onClick,
  isSelected = false,
  className,
  size = "md",
  showDetails = true,
}) => {
  const { turma } = alocacao
  const disciplina = turma.disciplinaOfertada.disciplina
  const professor = turma.professorAlocado

  // Formatação do horário
  const formatTime = (time: string) => {
    return time.substring(0, 5) // Remove segundos se existirem
  }

  // Cores baseadas no tipo de disciplina ou turma
  const getCardVariant = () => {
    // Pode ser expandido para diferentes cores baseadas em critérios
    return "default"
  }

  // Tamanhos do card
  const sizeClasses = {
    sm: "text-xs p-1",
    md: "text-sm p-2",
    lg: "text-base p-3",
  }

  const handleClick = () => {
    onClick?.(alocacao)
  }

  const cardContent = (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "border-l-primary border-l-4",
        isSelected && "ring-primary ring-2 ring-offset-2",
        onClick && "hover:bg-accent/50",
        sizeClasses[size],
        className,
      )}
      onClick={handleClick}
    >
      <CardContent className="space-y-1 p-2">
        {/* Código da turma e disciplina */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="font-mono text-xs"
          >
            {turma.codigoDaTurma}
          </Badge>
          {showDetails && (
            <div className="text-muted-foreground flex items-center text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {formatTime(alocacao.horaInicio)} - {formatTime(alocacao.horaFim)}
            </div>
          )}
        </div>

        {/* Nome da disciplina */}
        <div className="flex items-start space-x-1">
          <BookOpen className="text-muted-foreground mt-0.5 h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-2 text-xs leading-tight font-medium">
            {disciplina.nome}
          </span>
        </div>

        {/* Professor */}
        {professor && showDetails && (
          <div className="flex items-center space-x-1">
            <User className="text-muted-foreground h-3 w-3 flex-shrink-0" />
            <span className="text-muted-foreground truncate text-xs">
              {professor.nome}
            </span>
          </div>
        )}

        {/* Código da disciplina */}
        {showDetails && (
          <div className="flex items-center space-x-1">
            <Hash className="text-muted-foreground h-3 w-3 flex-shrink-0" />
            <span className="text-muted-foreground font-mono text-xs">
              {disciplina.codigo}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Se showDetails é false, envolver em tooltip com informações completas
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs"
          >
            <div className="space-y-2">
              <div className="font-semibold">{disciplina.nome}</div>
              <div className="text-sm">
                <div>Turma: {turma.codigoDaTurma}</div>
                <div>Código: {disciplina.codigo}</div>
                <div>
                  Horário: {formatTime(alocacao.horaInicio)} -{" "}
                  {formatTime(alocacao.horaFim)}
                </div>
                {professor && <div>Professor: {professor.nome}</div>}
                <div>Carga Horária: {disciplina.cargaHoraria}h</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return cardContent
}

/**
 * Componente compacto para exibir alocação em espaços pequenos
 */
export const AlocacaoCardCompact: React.FC<
  Omit<AlocacaoCardProps, "size" | "showDetails">
> = (props) => {
  return (
    <AlocacaoCard
      {...props}
      size="sm"
      showDetails={false}
    />
  )
}

/**
 * Componente detalhado para exibir alocação com todas as informações
 */
export const AlocacaoCardDetailed: React.FC<
  Omit<AlocacaoCardProps, "size" | "showDetails">
> = (props) => {
  return (
    <AlocacaoCard
      {...props}
      size="lg"
      showDetails={true}
    />
  )
}

export default AlocacaoCard
