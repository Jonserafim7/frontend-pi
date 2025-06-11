import {
  CalendarCog,
  Clock,
  Sun,
  Sunset,
  Moon,
  Settings2,
  GraduationCap,
} from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"
import { DuracaoAulasForm } from "../components/duracao-aulas-form"
import { QuantidadeAulasForm } from "../components/quantidade-aulas-form"
import { HorarioInicioTurnoForm } from "../components/horario-inicio-turno-form"
import { TurnoHorariosDetalhes } from "../components/turno-horarios-detalhes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
/**
 * Página para gerenciar as configurações globais de horário.
 * Apenas acessível por usuários com o papel de DIRETOR.
 */
export function ConfiguracoesHorarioPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 lg:px-8">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={CalendarCog} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              Configurações Globais de Horário
            </h1>
            <p className="text-muted-foreground">
              Defina os parâmetros para a geração de horários em toda a
              instituição.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Área de configurações gerais - ocupa 5/12 em telas grandes */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="text-primary h-5 w-5" />
                <CardTitle>Configurações Gerais</CardTitle>
              </div>
              <CardDescription>
                Parâmetros globais que afetam todos os turnos e horários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <GraduationCap className="text-primary h-4 w-4" />
                  Duração e Quantidade de Aulas
                </h3>
                <div className="w-full space-y-4">
                  <DuracaoAulasForm />
                  <Separator />
                  <QuantidadeAulasForm />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="text-primary h-5 w-5" />
                <CardTitle>Horários de Início dos Turnos</CardTitle>
              </div>
              <CardDescription>
                Configure o horário de início para cada turno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <h4 className="font-medium">Turno da Manhã</h4>
                </div>
                <HorarioInicioTurnoForm turno="manha" />
              </div>

              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Sunset className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Turno da Tarde</h4>
                </div>
                <HorarioInicioTurnoForm turno="tarde" />
              </div>

              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <h4 className="font-medium">Turno da Noite</h4>
                </div>
                <HorarioInicioTurnoForm turno="noite" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de visualização dos horários - ocupa 7/12 em telas grandes */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarCog className="text-primary h-5 w-5" />
                <CardTitle>Visualização dos Horários</CardTitle>
              </div>
              <CardDescription>
                Veja como as configurações afetam os horários de cada turno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="manha"
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="manha"
                    className="flex items-center gap-1"
                  >
                    <Sun className="h-4 w-4" />
                    <span>Manhã</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tarde"
                    className="flex items-center gap-1"
                  >
                    <Sunset className="h-4 w-4" />
                    <span>Tarde</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="noite"
                    className="flex items-center gap-1"
                  >
                    <Moon className="h-4 w-4" />
                    <span>Noite</span>
                  </TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="manha">
                    <TurnoHorariosDetalhes turno="manha" />
                  </TabsContent>
                  <TabsContent value="tarde">
                    <TurnoHorariosDetalhes turno="tarde" />
                  </TabsContent>
                  <TabsContent value="noite">
                    <TurnoHorariosDetalhes turno="noite" />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
