import { Eye, Users, Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeaderIconContainer } from "@/components/icon-container"

/**
 * Página de visualização de disponibilidades para coordenadores
 * TODO: Implementar funcionalidade completa
 */
export function CoordenadorDisponibilidadePage() {
  return (
    <div className="container mx-auto space-y-8 p-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <HeaderIconContainer Icon={Eye} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Disponibilidades dos Professores</h1>
          <p className="text-muted-foreground">
            Visualize e monitore as disponibilidades de todos os professores
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-medium">Professores</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-muted-foreground text-xs">
              Total de professores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">--</div>
            <p className="text-muted-foreground text-xs">
              Horários disponíveis para agendamento
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-2">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-sm font-medium">Indisponíveis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">--</div>
            <p className="text-muted-foreground text-xs">
              Horários bloqueados ou indisponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">--</div>
            <p className="text-muted-foreground text-xs">
              Total de registros no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para funcionalidade futura */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidade em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <Eye className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Em breve</h3>
              <p className="text-muted-foreground max-w-md">
                A visualização detalhada das disponibilidades dos professores será
                implementada em uma próxima versão.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
