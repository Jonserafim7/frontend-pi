import React from "react"
import { LoginForm } from "@/features/auth/components/login-form"
import { ModeToggle } from "@/components/common/theme-toggler"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/**
 * Página de login
 * Renderiza o formulário de login com layout e estilização apropriados
 */
export function LoginPage(): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sistema de Agendamento Acadêmico
          </CardTitle>
          <CardDescription className="text-center">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          <LoginForm />
        </CardContent>
        
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
          <Separator className="mb-4" />
          <p>Precisa de ajuda?</p>
          <p>Contate o administrador do sistema</p>
        </CardFooter>
      </Card>
    </div>
  )
}
