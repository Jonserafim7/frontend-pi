import { useNavigate } from "react-router"
import {
  CalendarRange,
  School,
  GraduationCap,
  Clock,
  ChevronRight,
  UserCog,
  Home,
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

interface MenuCardProps {
  titulo: string
  descricao: string
  icone: React.ReactNode
  cor: string
  rota: string
  badgeTexto?: string
}

/**
 * Dashboard para o Diretor navegar para as outras páginas do sistema
 * @returns Componente de Dashboard do Diretor
 */
export function DashboardDiretor() {
  const navigate = useNavigate()

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

  // Definição dos menus disponíveis para o diretor
  const menus = [
    {
      id: "config-horarios",
      categoria: "configuracoes",
      titulo: "Configurações de Horários",
      descricao:
        "Definir horários padrões, períodos e configurações globais do sistema",
      icone: (
        <div className="bg-primary/20 rounded-full p-2">
          <Clock className="text-primary h-5 w-5" />
        </div>
      ),
      cor: "border-l-primary",
      rota: "/diretor/configuracoes-horario",
      badgeTexto: "Global",
    },
    {
      id: "cursos",
      categoria: "academico",
      titulo: "Gestão de Cursos",
      descricao: "Cadastrar, editar e gerenciar os cursos da instituição",
      icone: (
        <div className="bg-primary/20 rounded-full p-2">
          <GraduationCap className="text-primary h-5 w-5" />
        </div>
      ),
      cor: "border-l-primary",
      rota: "/diretor/cursos",
    },
    {
      id: "coordenadores",
      categoria: "pessoal",
      titulo: "Coordenadores",
      descricao: "Gerenciar coordenadores e atribuições aos cursos",
      icone: (
        <div className="bg-primary/20 rounded-full p-2">
          <UserCog className="text-primary h-5 w-5" />
        </div>
      ),
      cor: "border-l-primary",
      rota: "/usuarios",
    },
  ]

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={Home} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Dashboard do Diretor</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de controle do diretor. Utilize os cards abaixo
            para navegar pelo sistema.
          </p>
        </div>
      </div>

      <Separator className="my-12" />

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <School className="text-primary h-5 w-5" />
              </div>
              <CardTitle>Sistema de Agendamento Acadêmico</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Este sistema permite gerenciar todos os aspectos do agendamento
              acadêmico de forma eficiente e organizada. Como diretor, você tem
              acesso a todas as funcionalidades do sistema.
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/diretor/ajuda")}
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
    </div>
  )
}
