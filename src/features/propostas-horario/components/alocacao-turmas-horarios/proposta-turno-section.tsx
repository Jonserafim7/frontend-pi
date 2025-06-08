import { Badge } from "@/components/ui/badge"
import { PropostaScheduleCellContainer } from "./proposta-schedule-cell-container"
import type { PropostaTurnoSectionProps } from "../../types/proposta-allocation-types"
import { DIAS_SEMANA } from "../../types/proposta-allocation-types"

/**
 * Componente que representa uma seção da grade de horários para um turno específico (manhã, tarde ou noite)
 * adaptado para propostas.
 *
 * Diferenças da versão geral:
 * - Usa PropostaScheduleCellContainer ao invés do container geral
 * - Passa propostaId para os containers das células
 * - Integrado com sistema de permissões de propostas
 *
 * @param {PropostaTurnoSectionProps} props
 * @returns {JSX.Element}
 */
export function PropostaTurnoSection({
  titulo,
  aulas,
  inicio,
  fim,
  alocacoesMap,
  propostaId,
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

            {/* Células para cada dia da semana - USANDO CONTAINER ESPECÍFICO DE PROPOSTA */}
            {DIAS_SEMANA.map((dia) => {
              const chaveAlocacao = `${dia.key}_${aula.inicio}`
              const alocacaoEncontrada = alocacoesMap.get(chaveAlocacao)

              return (
                <PropostaScheduleCellContainer
                  key={`${dia.key}-${aula.inicio}`}
                  dia={dia.key}
                  horario={aula}
                  alocacao={alocacaoEncontrada}
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
