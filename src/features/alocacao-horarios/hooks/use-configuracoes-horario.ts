import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"

/**
 * Hook para buscar configurações de horário para o módulo de alocação
 * Usado pelo grid de alocação para obter os slots por turno
 */
export const useConfiguracaoHorario = () => {
  const query = useConfiguracoesHorarioControllerGet({})

  return {
    ...query,
    hasPermission: true,
  }
}

/**
 * Tipo para os dados de configuração de horário
 */
export type ConfiguracaoHorario = NonNullable<
  ReturnType<typeof useConfiguracaoHorario>["data"]
>

/**
 * Tipo para os turnos disponíveis
 */
export type TurnoType = "manha" | "tarde" | "noite"

/**
 * Tipo para os dados de um turno específico
 */
export interface TurnoData {
  titulo: string
  inicioTurno: string
  fimTurno: string
  aulas: Array<{ inicio: string; fim: string }>
}

/**
 * Função utilitária para extrair dados de um turno específico
 */
export const getTurnoData = (
  configuracao: ConfiguracaoHorario | undefined,
  turno: TurnoType,
): TurnoData | null => {
  if (!configuracao) return null

  const turnoInfo = {
    manha: {
      titulo: "Manhã",
      inicioTurno: configuracao.inicioTurnoManha,
      fimTurno: configuracao.fimTurnoManhaCalculado,
      aulas: configuracao.aulasTurnoManha || [],
    },
    tarde: {
      titulo: "Tarde",
      inicioTurno: configuracao.inicioTurnoTarde,
      fimTurno: configuracao.fimTurnoTardeCalculado,
      aulas: configuracao.aulasTurnoTarde || [],
    },
    noite: {
      titulo: "Noite",
      inicioTurno: configuracao.inicioTurnoNoite,
      fimTurno: configuracao.fimTurnoNoiteCalculado,
      aulas: configuracao.aulasTurnoNoite || [],
    },
  }

  return turnoInfo[turno]
}
