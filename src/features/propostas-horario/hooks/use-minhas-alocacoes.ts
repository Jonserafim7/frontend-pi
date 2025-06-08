import { useAlocacoesHorariosControllerFindMinhasAlocacoes } from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

/**
 * Hook para buscar as alocações de horário do professor logado
 */
export function useMinhasAlocacoes() {
  return useAlocacoesHorariosControllerFindMinhasAlocacoes({
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  })
}

/**
 * Tipo para as estatísticas das alocações
 */
export interface AlocacoesStats {
  totalAlocacoes: number
  disciplinasUnicas: number
  diasAtivos: number
  cargaHorariaSemanal: number
}

/**
 * Hook para calcular estatísticas das alocações do professor
 */
export function useAlocacoesStats(
  alocacoes: AlocacaoHorarioResponseDto[] = [],
): AlocacoesStats {
  const stats: AlocacoesStats = {
    totalAlocacoes: alocacoes.length,
    disciplinasUnicas: 0,
    diasAtivos: 0,
    cargaHorariaSemanal: 0,
  }

  if (alocacoes.length === 0) {
    return stats
  }

  // Calcular disciplinas únicas
  const disciplinasSet = new Set(
    alocacoes.map((a) => a.turma.disciplinaOfertada.disciplina.nome),
  )
  stats.disciplinasUnicas = disciplinasSet.size

  // Calcular dias ativos
  const diasSet = new Set(alocacoes.map((a) => a.diaDaSemana))
  stats.diasAtivos = diasSet.size

  // Calcular carga horária semanal (considerando duração das aulas)
  stats.cargaHorariaSemanal = alocacoes.reduce((total, alocacao) => {
    const inicio = new Date(`1970-01-01T${alocacao.horaInicio}:00`)
    const fim = new Date(`1970-01-01T${alocacao.horaFim}:00`)
    const duracao = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60) // em horas
    return total + duracao
  }, 0)

  return stats
}
