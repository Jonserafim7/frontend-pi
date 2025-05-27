import { useMemo } from "react"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import { useAlocacoes } from "./use-alocacoes"
import { type TurmaDisplay } from "../types"

/**
 * Hook para buscar turmas preparadas para alocação
 * Combina dados reais de turmas da API com contagem de alocações
 */
export function useTurmasAlocacao(periodoLetivoId?: string) {
  // Buscar turmas reais da API
  const turmasQuery = useTurmasControllerFindAll({
    idPeriodoLetivo: periodoLetivoId,
  })

  // Buscar alocações reais da API
  const alocacoesQuery = useAlocacoes({
    idPeriodoLetivo: periodoLetivoId,
  })

  // Processar dados para combinar turmas + contagem de alocações
  const turmasDisplay = useMemo(() => {
    if (!turmasQuery.data || !alocacoesQuery.data) return []

    return turmasQuery.data.map((turma: any) => {
      // Extrair dados da turma (API retorna objetos complexos)
      const disciplinaOfertada = turma.disciplinaOfertada as any
      const professorAlocado = turma.professorAlocado as any

      const cargaHorariaSemanal =
        disciplinaOfertada?.disciplina?.cargaHoraria || 4

      // Contar quantas aulas esta turma já tem alocadas
      const aulasAlocadas = alocacoesQuery.data.filter(
        (alocacao) => alocacao.turmaId === turma.id,
      ).length

      // Determinar status baseado nas alocações
      let status: TurmaDisplay["status"] = "nao-alocada"

      if (!professorAlocado || !professorAlocado.nome) {
        status = "sem-professor"
      } else if (aulasAlocadas === 0) {
        status = "nao-alocada"
      } else if (aulasAlocadas >= cargaHorariaSemanal) {
        status = "completa"
      } else {
        status = "parcial"
      }

      const turmaDisplay: TurmaDisplay = {
        id: turma.id,
        codigo: turma.codigoDaTurma || `TUR-${turma.id.slice(-4)}`,
        disciplina:
          disciplinaOfertada?.disciplina?.nome || "Disciplina não definida",
        professor: professorAlocado?.nome || "Sem Professor",
        professorId: professorAlocado?.id,
        aulasAlocadas,
        cargaHorariaSemanal,
        status,
      }

      return turmaDisplay
    })
  }, [turmasQuery.data, alocacoesQuery.data])

  return {
    data: turmasDisplay,
    isLoading: turmasQuery.isLoading || alocacoesQuery.isLoading,
    error: turmasQuery.error || alocacoesQuery.error,
    refetch: () => {
      turmasQuery.refetch()
      alocacoesQuery.refetch()
    },
  }
}

/**
 * Hook para estatísticas das turmas
 */
export function useTurmasStats(turmas: TurmaDisplay[]) {
  return useMemo(() => {
    const completas = turmas.filter((t) => t.status === "completa").length
    const parciais = turmas.filter((t) => t.status === "parcial").length
    const naoAlocadas = turmas.filter((t) => t.status === "nao-alocada").length
    const semProfessor = turmas.filter((t) => t.status === "sem-professor").length

    return {
      completas,
      parciais,
      naoAlocadas,
      semProfessor,
      total: turmas.length,
    }
  }, [turmas])
}
