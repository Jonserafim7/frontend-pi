import { Link } from "react-router"
import {
  CalendarCog,
  CalendarIcon,
  GraduationCapIcon,
  HomeIcon,
  LogOut,
  UsersIcon,
} from "lucide-react"
import { useAuth } from "@/features/auth/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useLocation } from "react-router"

/**
 * Componente de sidebar da aplicação
 * Exibe diferentes opções de menu de acordo com o papel do usuário
 */
export function AppSidebar() {
  const location = useLocation()
  const { user, logout, isAdmin, isDiretor, isCoordenador, isProfessor } =
    useAuth()

  // Função para obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (!user?.nome) return "U"

    const nameParts = user.nome.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    )
  }

  const isPathActive = (path: string) => location.pathname === path
  const isHomeActive = () =>
    location.pathname === "/admin" ||
    location.pathname === "/diretor" ||
    location.pathname === "/coordenador" ||
    location.pathname === "/professor"

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="bg-primary flex items-center justify-center rounded-md p-1">
            <GraduationCapIcon className="text-primary-foreground h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">AcadSchedule</span>
            <span className="text-muted-foreground text-xs">
              Gerenciamento Acadêmico
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu comum para todos os usuários */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Início"
                  isActive={isHomeActive()}
                >
                  <Link to="/">
                    <HomeIcon />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu para Administradores */}
        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Usuários"
                    isActive={isPathActive("/usuarios")}
                  >
                    <Link to="/usuarios">
                      <UsersIcon />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menu para Diretores */}
        {isDiretor() && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Cursos"
                    isActive={isPathActive("/diretor/cursos")}
                  >
                    <Link to="/diretor/cursos">
                      <GraduationCapIcon />
                      <span>Cursos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Usuários"
                    isActive={isPathActive("/usuarios")}
                  >
                    <Link to="/usuarios">
                      <UsersIcon />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Horários"
                    isActive={isPathActive("/horarios")}
                  >
                    <Link to="/diretor/configuracoes-horario">
                      <CalendarCog />
                      <span>Configurações de Horário</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menu para Coordenadores */}
        {isCoordenador() && (
          <SidebarGroup>
            <SidebarGroupLabel>Coordenação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Disciplinas"
                    isActive={isPathActive("/disciplinas")}
                  >
                    <Link to="/disciplinas">
                      <GraduationCapIcon />
                      <span>Disciplinas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Professores"
                    isActive={isPathActive("/professores")}
                  >
                    <Link to="/professores">
                      <UsersIcon />
                      <span>Professores</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Horários"
                    isActive={isPathActive("/horarios")}
                  >
                    <Link to="/horarios">
                      <CalendarIcon />
                      <span>Horários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menu para Professores */}
        {isProfessor() && (
          <SidebarGroup>
            <SidebarGroupLabel>Professor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Minhas Disciplinas"
                    isActive={isPathActive("/minhas-disciplinas")}
                  >
                    <Link to="/minhas-disciplinas">
                      <GraduationCapIcon />
                      <span>Minhas Disciplinas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Meu Horário"
                    isActive={isPathActive("/meu-horario")}
                  >
                    <Link to="/meu-horario">
                      <CalendarIcon />
                      <span>Meu Horário</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src={user?.avatarUrl} alt={user?.nome || "Usuário"} /> */}
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.nome}</span>
              <span className="text-muted-foreground text-xs">{user?.papel}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={logout}
          >
            <span className="sr-only">Sair</span>
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
