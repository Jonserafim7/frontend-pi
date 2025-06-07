import { Badge } from "@/components/ui/badge"
import { ScheduleCellContainer } from "./schedule-cell-container"
import type { TurnoSectionProps } from "./schedule-grid-types"
import { DIAS_SEMANA } from "./schedule-grid-types"

export function TurnoSection({
  titulo,
  aulas,
  inicio,
  fim,
  alocacoesMap,
  propostaId,
}: TurnoSectionProps) {
  return (
    <div>
      {/* Cabeçalho do turno */}
      <div className="mb-3 flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-sm"
        >
          {titulo}
        </Badge>
        <span className="text-muted-foreground text-sm">
          {inicio} - {fim}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {/* Linha de cabeçalho com os dias da semana */}
        <div className="bg-muted/50 grid grid-cols-7 border-b">
          <div className="border-r p-2 text-center text-sm font-medium">
            Horário
          </div>
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia.key}
              className="border-r p-2 text-center text-sm font-medium last:border-r-0"
            >
              {dia.label}
            </div>
          ))}
        </div>

        {/* Linhas de horários do turno */}
        {aulas.map((aula, index) => (
          <div
            key={index}
            className="grid grid-cols-7 border-b last:border-b-0"
          >
            {/* Coluna do horário (início/fim) */}
            <div className="bg-muted/30 border-r p-2 text-center text-sm">
              <div className="font-medium">{aula.inicio}</div>
              <div className="text-muted-foreground text-xs">{aula.fim}</div>
            </div>

            {/* Células para cada dia da semana */}
            {DIAS_SEMANA.map((dia) => {
              const chaveAlocacao = `${dia.key}_${aula.inicio}`
              const alocacoesEncontradas = alocacoesMap.get(chaveAlocacao) || []
              const primeiraAlocacao = alocacoesEncontradas[0]

              return (
                <ScheduleCellContainer
                  key={`${dia.key}-${aula.inicio}`}
                  dia={dia.key}
                  horario={aula}
                  alocacao={primeiraAlocacao}
                  alocacoes={alocacoesEncontradas}
                  propostaId={propostaId}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
