import { useParams, useNavigate } from "react-router"
import { ArrowLeft, User, Mail, Calendar, Shield, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HeaderIconContainer } from "@/components/icon-container"
import { useUsuariosControllerFindOne } from "@/api-generated/client/usuarios/usuarios"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Página de detalhes do usuário
 * @component
 * @example
 * <UserDetailsPage />
 *
 * @description
 * Exibe informações detalhadas de um usuário específico.
 * Para professores, oferece opções para visualizar disponibilidades.
 *
 * @returns {JSX.Element} Página de detalhes do usuário
 *
 * @since 1.0.0
 * @see {@link UserListPage} - Página que navega para esta
 */
export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isCoordenador, isAdmin, isDiretor } = useAuth()

  const {
    data: user,
    isPending,
    isError,
  } = useUsuariosControllerFindOne(id!, {
    query: {
      enabled: !!id,
    },
  })

  /**
   * Traduz o papel do usuário para português
   * @param papel - Papel do usuário
   * @returns string traduzida
   */
  const translateRole = (papel: string): string => {
    const translations = {
      ADMIN: "Administrador",
      DIRETOR: "Diretor",
      COORDENADOR: "Coordenador",
      PROFESSOR: "Professor",
    }
    return translations[papel as keyof typeof translations] || papel
  }

  /**
   * Retorna a cor do badge baseada no papel
   * @param papel - Papel do usuário
   * @returns variant do badge
   */
  const getRoleBadgeVariant = (papel: string) => {
    switch (papel) {
      case "ADMIN":
        return "destructive"
      case "DIRETOR":
        return "default"
      case "COORDENADOR":
        return "secondary"
      case "PROFESSOR":
        return "outline"
      default:
        return "outline"
    }
  }

  /**
   * Navega para as disponibilidades do professor
   */
  const handleViewDisponibilidades = () => {
    navigate(`/usuarios/${id}/disponibilidades`)
  }

  /**
   * Volta para a lista de usuários
   */
  const handleGoBack = () => {
    navigate("/usuarios")
  }

  // Verifica se o usuário pode ver disponibilidades
  const canViewDisponibilidades =
    user?.papel === "PROFESSOR" && (isCoordenador() || isAdmin() || isDiretor())

  if (isPending) {
    return (
      <div className="container mx-auto space-y-8 p-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !user) {
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
              <h3 className="mb-2 text-lg font-medium">Usuário não encontrado</h3>
              <p className="text-muted-foreground">
                O usuário que você está procurando não existe ou foi removido.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 p-12">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Usuários
        </Button>

        {/* Ações para professores */}
        {canViewDisponibilidades && (
          <Button
            onClick={handleViewDisponibilidades}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Ver Disponibilidades
          </Button>
        )}
      </div>

      {/* Título da página */}
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={User} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{user.nome}</h1>
          <p className="text-muted-foreground">
            Detalhes do {translateRole(user.papel).toLowerCase()}
          </p>
        </div>
      </div>

      <Separator />

      {/* Cards de informações */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Email:</span>
              </div>
              <span className="text-sm">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Papel:</span>
              </div>
              <Badge variant={getRoleBadgeVariant(user.papel)}>
                {translateRole(user.papel)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Cadastrado em:</span>
              </div>
              <span className="text-sm">
                {format(new Date(user.dataCriacao), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ações Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Ações Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canViewDisponibilidades && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleViewDisponibilidades}
              >
                <Clock className="mr-2 h-4 w-4" />
                Visualizar Disponibilidades
              </Button>
            )}

            {user.papel === "PROFESSOR" && !canViewDisponibilidades && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Não há ações específicas disponíveis para este professor no seu
                  nível de acesso.
                </p>
              </div>
            )}

            {user.papel !== "PROFESSOR" && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  As ações específicas variam de acordo com o papel do usuário.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações específicas para professores */}
      {user.papel === "PROFESSOR" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informações do Professor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              <p>
                Este usuário é um professor cadastrado no sistema.
                {canViewDisponibilidades &&
                  " Você pode visualizar suas disponibilidades de horário usando o botão acima."}
              </p>
              {!canViewDisponibilidades && (
                <p className="mt-2">
                  Para visualizar as disponibilidades deste professor, entre em
                  contato com um coordenador, diretor ou administrador.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
