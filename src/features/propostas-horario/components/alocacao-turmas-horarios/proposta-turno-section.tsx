import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PropostaScheduleCellContainer } from "./proposta-schedule-cell-container"
import type { PropostaTurnoSectionProps } from "../../types/proposta-allocation-types"
import { DIAS_SEMANA } from "../../types/proposta-allocation-types"

/**
 * Componente que representa uma seção da grade de horários para um turno específico (manhã, tarde ou noite)
 * adaptado para propostas.
 *
 * Características:
 * - Usa PropostaScheduleCellContainer ao invés do container geral
 * - Passa propostaId para os containers das células
 * - Integrado com sistema de permissões de propostas
 * - ScrollArea horizontal para suportar grades largas (células de 300px fixas)
 * - Largura mínima fixa de 1800px para garantir visibilidade adequada
 *
 * @param {PropostaTurnoSectionProps} props
 * @returns {JSX.Element}
 */
export function PropostaTurnoSection({
  titulo,
  aulas,
  inicio,
  fim,
  propostaId,
  readonly = false,
}: PropostaTurnoSectionProps) {
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

      {/* ScrollArea para permitir scroll horizontal na grade */}
      <ScrollArea className="w-full rounded-lg border whitespace-nowrap">
        <div className="w-max min-w-[1800px]">
          {/* Linha de cabeçalho com os dias da semana */}
          <div className="bg-muted/50 grid grid-cols-[200px_repeat(6,300px)] border-b">
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
              className="grid grid-cols-[200px_repeat(6,300px)] border-b last:border-b-0"
            >
              {/* Coluna do horário (início/fim) */}
              <div className="bg-muted/30 flex flex-col justify-center border-r p-2 text-center text-sm">
                <div className="font-medium">{aula.inicio}</div>
                <div className="text-muted-foreground text-xs">{aula.fim}</div>
              </div>

              {/* Células para cada dia da semana - USANDO CONTAINER ESPECÍFICO DE PROPOSTA */}
              {DIAS_SEMANA.map((dia) => {
                return (
                  <PropostaScheduleCellContainer
                    key={`${dia.key}-${aula.inicio}`}
                    dia={dia.key}
                    horario={aula}
                    propostaId={propostaId}
                    readonly={readonly}
                  />
                )
              })}
            </div>
          ))}
        </div>
        {/* ScrollBar horizontal é essencial para o funcionamento */}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
