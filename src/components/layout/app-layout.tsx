import { Outlet } from "react-router"
import { Toaster } from "@/components/ui/sonner"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { ModeToggle } from "../theme-toggler"

/**
 * Layout principal da aplicação
 * Inclui a sidebar dinâmica baseada no papel do usuário e o conteúdo principal
 */
const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Sidebar dinâmica baseada no papel do usuário */}
      <AppSidebar />

      {/* Conteúdo principal */}
      <SidebarInset className="flex min-h-screen w-full flex-1 flex-col">
        <header className="bg-background sticky top-0 z-10 border-b">
          <div className="flex h-14 items-center p-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <ModeToggle />
          </div>
        </header>

        <main className="w-full flex-1 p-6">
          <Outlet /> {/* Conteúdo da rota será renderizado aqui */}
        </main>

        <footer className="border-t px-6 py-4">
          <p className="text-muted-foreground text-center text-sm">
            © {new Date().getFullYear()} AcadSchedule - Sistema de Gerenciamento
            Acadêmico
          </p>
        </footer>
      </SidebarInset>

      {/* Toaster para notificações - configurado no canto inferior direito */}
      <Toaster />
    </SidebarProvider>
  )
}

export default AppLayout
