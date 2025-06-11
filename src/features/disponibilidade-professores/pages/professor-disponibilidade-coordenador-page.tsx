import { useParams, useNavigate } from "react-router"
import { Clock, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResumoHorariosCards } from "../components/resumo-horarios-cards"
import { HeaderIconContainer } from "@/components/icon-container"
import { DisponibilidadeGrid } from "../components/grid"
import { useDisponibilidadeProfessorControllerFindByProfessor } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { usePeriodosLetivosControllerFindPeriodoAtivo } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { useUsuariosControllerFindOne } from "@/api-generated/client/usuarios/usuarios"
import type { DisponibilidadeResponseDto } from "@/api-generated/model"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Página para coordenadores visualizarem disponibilidades de professores
 * @component
 * @example
 * <ProfessorDisponibilidadeCoordenadorPage />
 *
 * @description
 * Permite que coordenadores, diretores e administradores visualizem
 * as disponibilidades de um professor específico em modo somente leitura.
 * Inclui resumo estatístico e grid completo de horários.
 *
 * @returns {JSX.Element} Página de visualização de disponibilidades
 *
 * @since 1.0.0
 * @see {@link ProfessorDisponibilidadePage} - Página para o próprio professor
 * @see {@link UserDetailsPage} - Página que navega para esta
 */
export function ProfessorDisponibilidadeCoordenadorPage() {
  const { professorId } = useParams<{ professorId: string }>()
  const navigate = useNavigate()
  const { isCoordenador, isAdmin, isDiretor } = useAuth()

  // Buscar dados do professor
  const {
    data: professor,
    isPending: isLoadingProfessor,
    isError: isErrorProfessor,
  } = useUsuariosControllerFindOne(professorId!, {
    query: {
      enabled: !!professorId,
    },
  })

  // Buscar período ativo
  const { data: periodoAtivo, isLoading: isLoadingPeriodo } =
    usePeriodosLetivosControllerFindPeriodoAtivo()

  // Buscar disponibilidades do professor
  const { data: disponibilidades, isLoading: isLoadingDisponibilidades } =
    useDisponibilidadeProfessorControllerFindByProfessor(
      professorId || "",
      { periodoLetivoId: periodoAtivo?.id || "" },
      {
        query: {
          enabled: !!professorId && !!periodoAtivo?.id,
        },
      },
    )

  /**
   * Navega de volta para os detalhes do usuário
   */
  const handleGoBack = () => {
    navigate(`/usuarios/${professorId}`)
  }

  // Verificação de permissões
  if (!isCoordenador() && !isAdmin() && !isDiretor()) {
    return (
      <div className="container mx-auto p-12">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">Acesso Negado</h3>
              <p className="text-muted-foreground">
                Você não tem permissão para visualizar as disponibilidades deste
                professor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading states
  if (isLoadingProfessor || isLoadingPeriodo) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Error states
  if (isErrorProfessor || !professor) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                Professor não encontrado
              </h3>
              <p className="text-muted-foreground">
                O professor que você está procurando não existe ou foi removido.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar se o usuário é realmente um professor
  if (professor.papel !== "PROFESSOR") {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                Usuário não é professor
              </h3>
              <p className="text-muted-foreground">
                Este usuário não possui o papel de professor no sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!periodoAtivo) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                Nenhum Período Letivo Ativo
              </h3>
              <p className="text-muted-foreground">
                Não há período letivo ativo no momento para consultar
                disponibilidades.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular estatísticas das disponibilidades
  const disponiveisCount =
    disponibilidades?.filter(
      (d: DisponibilidadeResponseDto) => d.status === "DISPONIVEL",
    ).length || 0
  const indisponiveisCount =
    disponibilidades?.filter(
      (d: DisponibilidadeResponseDto) => d.status === "INDISPONIVEL",
    ).length || 0
  const totalCount = disponibilidades?.length || 0

  return (
    <div className="container mx-auto space-y-8 p-12">
      {/* Header com navegação */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Detalhes
        </Button>
      </div>

      {/* Título da página */}
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={Clock} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            Disponibilidades de {professor.nome}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Período {periodoAtivo.ano}.{periodoAtivo.semestre} •
            </p>
            <Badge variant="outline">Visualização</Badge>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <ResumoHorariosCards
        disponiveisCount={disponiveisCount}
        indisponiveisCount={indisponiveisCount}
        totalCount={totalCount}
      />

      {/* Grid de Disponibilidades - Modo Somente Leitura */}
      <DisponibilidadeGrid
        professorId={professorId!}
        periodoId={periodoAtivo.id}
        disponibilidades={disponibilidades || []}
        isLoading={isLoadingDisponibilidades}
        readonly={true}
      />

      {/* Informações adicionais */}
      {totalCount === 0 && !isLoadingDisponibilidades && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                Nenhuma disponibilidade cadastrada
              </h3>
              <p className="text-muted-foreground">
                Este professor ainda não cadastrou suas disponibilidades para o
                período letivo ativo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
