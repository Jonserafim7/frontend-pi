import { useConfiguracoesHorarioControllerGet } from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import type { TurnoType } from "@/features/configuracoes-horario/lib/constants"

/**
 * Hook para buscar configurações de horário
 * Usado pelos grids de disponibilidade para obter os slots por turno
 * Trata erro 403 (professor não tem permissão) de forma elegante
 */
export const useConfiguracaoHorario = () => {
  const query = useConfiguracoesHorarioControllerGet({})

  // Se o erro for 403 (Forbidden), retorna um estado especial
  if (query.error && "status" in query.error && query.error.status === 403) {
    return {
      ...query,
      data: null,
      isError: false, // Não tratamos 403 como erro para professores
      hasPermission: false,
    }
  }

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

// TurnoType agora é importado de @/features/configuracoes-horario/lib/constants
// Mantido para compatibilidade, mas deve usar o tipo centralizado

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
