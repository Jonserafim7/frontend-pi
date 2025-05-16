import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/auth-context"

/**
 * Página de acesso não autorizado
 *
 * Exibida quando um usuário tenta acessar uma rota para a qual não possui permissão.
 */
export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { userRole } = useAuth()

  /**
   * Redireciona o usuário para a página inicial adequada para seu papel
   */
  function backToMainArea() {
    navigate("/dashboard")
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-[450px] shadow-lg">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center text-red-500">
            <AlertCircle size={64} />
          </div>
          <CardTitle className="text-center text-2xl">
            Acesso Não Autorizado
          </CardTitle>
          <CardDescription className="text-center">
            Você não possui permissão para acessar este recurso.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Seu papel atual ({userRole}) não tem acesso a esta funcionalidade.
            Entre em contato com um administrador caso acredite que deveria ter
            acesso.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={backToMainArea}
            className="w-full"
          >
            Voltar para a Área Principal
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
