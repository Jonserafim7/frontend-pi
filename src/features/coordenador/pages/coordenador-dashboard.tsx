import { useNavigate } from "react-router"
import {
  CalendarRange,
  ClipboardList,
  ChevronRight,
  Home,
  Users,
  BookOpen,
  Calendar,
  Grid3X3,
  User,
  FileText,
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
 * Dashboard para o Coordenador navegar para as outras páginas do sistema
 * @returns Componente de Dashboard do Coordenador
 */
export function CoordenadorDashboard() {
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
          <CardDescription className="leading-relaxed">
            {descricao}
          </CardDescription>
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

  // Definição dos menus disponíveis para o coordenador
  const menus = [
    {
      id: "propostas-horario",
      titulo: "Propostas de Horário",
      descricao:
        "Criar, editar e gerenciar propostas de horário para seus cursos",
      icone: (
        <div className="bg-primary/20 rounded-full p-2">
          <ClipboardList className="text-primary h-5 w-5" />
        </div>
      ),
      cor: "border-l-primary",
      rota: "/coordenador/propostas-horario",
      badgeTexto: "Principal",
    },
    {
      id: "disciplinas",
      titulo: "Disciplinas",
      descricao: "Gerenciar disciplinas do sistema acadêmico",
      icone: (
        <div className="rounded-full bg-blue-500/20 p-2">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
      ),
      cor: "border-l-blue-500",
      rota: "/coordenador/disciplinas",
      badgeTexto: "Gestão",
    },
    {
      id: "matrizes-curriculares",
      titulo: "Matrizes Curriculares",
      descricao: "Gerenciar matrizes curriculares dos cursos",
      icone: (
        <div className="rounded-full bg-teal-500/20 p-2">
          <Calendar className="h-5 w-5 text-teal-600" />
        </div>
      ),
      cor: "border-l-teal-500",
      rota: "/coordenador/matrizes-curriculares",
      badgeTexto: "Gestão",
    },
    {
      id: "disciplinas-ofertadas",
      titulo: "Disciplinas Ofertadas",
      descricao: "Gerenciar as disciplinas oferecidas no período letivo",
      icone: (
        <div className="rounded-full bg-purple-500/20 p-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
        </div>
      ),
      cor: "border-l-purple-500",
      rota: "/coordenador/disciplinas-ofertadas",
      badgeTexto: "Gestão",
    },
    {
      id: "turmas",
      titulo: "Turmas",
      descricao: "Gerenciar turmas e alocação de professores",
      icone: (
        <div className="rounded-full bg-orange-500/20 p-2">
          <Grid3X3 className="h-5 w-5 text-orange-600" />
        </div>
      ),
      cor: "border-l-orange-500",
      rota: "/coordenador/turmas",
      badgeTexto: "Gestão",
    },
    {
      id: "professores",
      titulo: "Professores",
      descricao: "Gerenciar professores e suas informações acadêmicas",
      icone: (
        <div className="rounded-full bg-emerald-500/20 p-2">
          <Users className="h-5 w-5 text-emerald-600" />
        </div>
      ),
      cor: "border-l-emerald-500",
      rota: "/usuarios",
      badgeTexto: "Gestão",
    },
  ]

  return (
    <div className="container mx-auto space-y-8 p-12">
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={Home} />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Dashboard do Coordenador</h1>
          <p className="text-muted-foreground">
            Olá, {user?.nome}! Bem-vindo ao seu painel de coordenação. Gerencie
            disciplinas, turmas, professores e crie propostas de horário para seus
            cursos.
          </p>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Cards de Funcionalidades */}
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

      <div className="mt-8">
        <Card className="from-primary/10 to-primary/5 border-dashed bg-gradient-to-br">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2">
                <User className="text-primary h-5 w-5" />
              </div>
              <CardTitle>Portal do Coordenador</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Este é o seu portal de coordenação acadêmica. Aqui você pode
              gerenciar todos os aspectos dos cursos sob sua responsabilidade,
              desde a criação de propostas de horário até o gerenciamento de
              professores e disciplinas. Mantenha os dados sempre atualizados para
              garantir o bom funcionamento do sistema acadêmico.
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/coordenador/ajuda")}
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

      {/* Cards adicionais com informações úteis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Propostas de Horário
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
              Crie e gerencie propostas de horário para seus cursos. Lembre-se de
              submeter as propostas dentro do prazo estabelecido pela direção.
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/20 p-2">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-emerald-900 dark:text-emerald-100">
                Gestão de Professores
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
              Mantenha os dados dos professores atualizados e monitore suas
              disponibilidades para otimizar a alocação de turmas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
