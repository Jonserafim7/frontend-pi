import { useNavigate } from "react-router"
import {
  CalendarRange,
  Clock,
  ChevronRight,
  Home,
  BookOpen,
  User,
  CalendarCheck,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Link } from "react-router"
import { HeaderIconContainer } from "@/components/icon-container"
import { useAuth } from "@/features/auth/contexts/auth-context"

interface MenuCardProps {
  titulo: string
  descricao: string
  icone: React.ReactNode
  cor: string
  rota: string
  badgeTexto?: string
}

/**
 * Dashboard para o Professor navegar para as outras páginas do sistema
 * @returns Componente de Dashboard do Professor
 */
export function ProfessorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  /**
   * Componente de card de menu
   */
  const MenuCard = ({ titulo, descricao, icone, rota }: MenuCardProps) => {
    return (
      <Card
        className={cn(
          "overflow-hidden pt-0 transition-all duration-300 hover:shadow-md",
        )}
      >
        <CardHeader
          className={cn(`from-primary/10 bg-gradient-to-r to-transparent py-4`)}
        >
          <div className="flex items-center gap-3">
            {icone}
            <div className="flex-1">
              <CardTitle className="text-lg">{titulo}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-start pt-2 pb-4">
          <CardDescription>{descricao}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link
              to={rota}
              className="flex items-center gap-2"
            >
              Acessar Funcionalidade
              <ChevronRight />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Definição dos menus disponíveis para o professor
  const menus = [
    {
      id: "disponibilidades",
      categoria: "horarios",
      titulo: "Disponibilidades",
      descricao:
        "Gerenciar sua disponibilidade de horários para alocação de turmas",
      icone: (
        <div className="bg-primary/20 rounded-full p-2">
          <Clock className="text-primary h-5 w-5" />
        </div>
      ),
      cor: "border-l-primary",
      rota: "/professor/disponibilidades",
      badgeTexto: "Configuração",
    },
    {
      id: "minhas-aulas",
      categoria: "aulas",
      titulo: "Minhas Aulas",
      descricao: "Visualizar todas as suas turmas e horários alocados",
      icone: (
        <div className="bg-primary/20 rounded-full p-2">
          <CalendarCheck className="text-primary h-5 w-5" />
        </div>
      ),
      cor: "border-l-primary",
      rota: "/professor/minhas-alocacoes",
      badgeTexto: "Consulta",
    },
  ]

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={Home} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Dashboard do Professor</h1>
          <p className="text-muted-foreground">
            Olá, {user?.nome}! Bem-vindo ao seu painel de controle. Utilize os
            cards abaixo para gerenciar seus horários e visualizar suas aulas.
          </p>
        </div>
      </div>

      <Separator className="my-12" />

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id}
              titulo={menu.titulo}
              descricao={menu.descricao}
              icone={menu.icone}
              cor={menu.cor}
              rota={menu.rota}
              badgeTexto={menu.badgeTexto}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Card className="from-primary/10 to-primary/5 border-dashed bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2">
                <User className="text-primary h-5 w-5" />
              </div>
              <CardTitle>Portal do Professor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Este é o seu portal pessoal no sistema de agendamento acadêmico.
              Aqui você pode gerenciar sua disponibilidade de horários e consultar
              todas as turmas em que foi alocado. Mantenha suas informações sempre
              atualizadas para um melhor funcionamento do sistema.
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/professor/ajuda")}
                disabled
              >
                Acessar Ajuda
              </Button>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CalendarRange className="size-4" />
                Ano Letivo Atual: {new Date().getFullYear()}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Card adicional com informações úteis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Disponibilidades
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Mantenha suas disponibilidades sempre atualizadas para que os
              coordenadores possam alocar suas turmas nos melhores horários.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-900 dark:text-green-100">
                Aulas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800 dark:text-green-200">
              Visualize todas as suas turmas, horários e informações das
              disciplinas que você leciona em uma interface organizada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
