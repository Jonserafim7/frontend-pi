import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, CalendarCheck } from "lucide-react"
import { HeaderIconContainer } from "@/components/icon-container"

export function Header() {
  return (
    <div className="flex h-20 items-center justify-between px-8">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-3">
          <HeaderIconContainer Icon={CalendarCheck} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Alocação de Horários</h1>
            <p className="text-muted-foreground">
              Gerencie os horários das turmas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 text-primary"
          >
            <Calendar className="mr-1 h-3 w-3" />
            {/* TODO: Pegar o período letivo atual */}
            2024/2
          </Badge>
          <Badge
            variant="outline"
            className="border-green-500/20 bg-green-500/10 text-green-600"
          >
            <Users className="mr-1 h-3 w-3" />
            {/* TODO: Pegar o número de turmas */}
            45 Turmas
          </Badge>
          <Badge
            variant="outline"
            className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600"
          >
            <Clock className="mr-1 h-3 w-3" />
            {/* TODO: Pegar o número de alocações pendentes */}
            12 Pendentes
          </Badge>
        </div>
      </div>
    </div>
  )
}
