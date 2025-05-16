import React from "react"
import { LoginForm } from "@/features/auth/components/login-form"
import { ModeToggle } from "@/components/theme-toggler"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GraduationCap } from "lucide-react"

/**
 * Página de login
 * Renderiza o formulário de login com layout e estilização apropriados
 */
export function LoginPage(): React.ReactElement {
  return (
    <div className="from-primary/10 relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden bg-gradient-to-t p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center gap-4 px-2">
        <div className="bg-primary flex items-center justify-center rounded-md p-1">
          <GraduationCap className="text-primary-foreground size-8" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">AcadSchedule</span>
          <span className="text-muted-foreground">
            Sistema de Gerenciamento Acadêmico
          </span>
        </div>
      </div>

      <Card className="border-border/40 w-full max-w-md overflow-hidden shadow-lg">
        <CardHeader className="pt-6 pb-3">
          <div className="flex flex-col items-center space-y-1">
            <CardTitle className="text-foreground text-center text-2xl font-bold tracking-tight">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center text-sm">
              Preencha os campos abaixo para acessar sua conta
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          <LoginForm />
        </CardContent>

        <CardFooter className="bg-muted/30 text-muted-foreground flex flex-col items-center py-4 text-sm">
          <Separator className="mb-4 w-3/4" />
          <div className="space-y-1 text-center">
            <p className="font-medium">Precisa de ajuda?</p>
            <p className="text-xs">Contate o administrador do sistema</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
