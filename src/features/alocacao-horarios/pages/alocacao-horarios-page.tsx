import React, { useState, useEffect } from "react"
import { DndProvider } from "../components/dnd-provider"
import { AlocacaoGrid } from "../components/alocacao-grid"
import { TurmasPanel } from "../components/turmas-panel"
import { Header } from "../components/header"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AlocacaoHorariosPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é mobile
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < 768)
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true) // Sidebar aberta por padrão no desktop
    }
  }

  // Configurar listener para mudanças de tamanho da tela
  useEffect(() => {
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="bg-background relative min-h-screen">
      <DndProvider>
        <Header />

        {/* Layout responsivo */}
        <div className="relative flex h-[calc(100vh-4rem)]">
          {/* Backdrop para mobile */}
          {isMobile && isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "bg-card fixed inset-y-16 left-0 z-50 w-80 transform border-r shadow-xl transition-transform duration-300 ease-in-out",
              "md:relative md:inset-y-0 md:z-0 md:shadow-none",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "md:translate-x-0", // Sempre visível no desktop
              !isSidebarOpen && "md:w-0 md:overflow-hidden", // Colapsada no desktop quando fechada
            )}
          >
            <div className="flex h-full flex-col">
              {/* Header da sidebar */}
              <div className="flex items-center justify-between border-b p-4 md:hidden">
                <h2 className="text-lg font-semibold">Turmas</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Conteúdo da sidebar */}
              <div className="flex-1 overflow-hidden">
                <TurmasPanel />
              </div>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <main className="flex min-w-0 flex-1 flex-col">
            {/* Botão toggle da sidebar */}
            <div className="bg-card/50 supports-[backdrop-filter]:bg-card/60 border-b backdrop-blur">
              <div className="flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0 md:h-9 md:w-9"
                >
                  {isSidebarOpen ?
                    <X className="h-4 w-4" />
                  : <Menu className="h-4 w-4" />}
                </Button>
                <div className="text-muted-foreground text-sm md:hidden">
                  Grid de Alocação
                </div>
              </div>
            </div>

            {/* Grid principal */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <AlocacaoGrid />
            </div>
          </main>
        </div>
      </DndProvider>
    </div>
  )
}
