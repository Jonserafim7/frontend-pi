import { useMemo } from "react"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import type {
  TurmaParaAlocacao,
  TurmasAlocacaoResult,
  FiltrosTurmasAlocacao,
  TurmaAllocationStatus,
  UseTurmasAlocacaoParams,
} from "../types"

/**
 * Hook para buscar e processar turmas específicas para alocação de horários
 * Reutiliza o hook existente da feature turmas e adiciona processamento específico
 */
export function useTurmasParaAlocacao({
  filtros,
  enabled = true,
}: UseTurmasAlocacaoParams) {
  // Usar o hook existente da feature turmas
  const {
    data: turmasRaw,
    isLoading,
    error,
    isSuccess,
    isFetching,
    refetch,
  } = useTurmasControllerFindAll(
    {
      idPeriodoLetivo: filtros.periodoLetivoId,
      ...(filtros.cursoId && { idCurso: filtros.cursoId }),
    },
    {
      query: {
        enabled: enabled && !!filtros.periodoLetivoId,
      },
    },
  )

  // Processar dados para adicionar informações de alocação
  const resultado: TurmasAlocacaoResult = useMemo(() => {
    if (!turmasRaw) {
      return {
        turmas: [],
        total: 0,
        porStatus: {
          naoAlocadas: [],
          parcialmenteAlocadas: [],
          totalmenteAlocadas: [],
          comConflitos: [],
        },
        estatisticas: {
          totalNaoAlocadas: 0,
          totalParcialmenteAlocadas: 0,
          totalTotalmenteAlocadas: 0,
          totalComConflitos: 0,
          percentualAlocado: 0,
        },
      }
    }

    // Processar cada turma para adicionar informações de alocação
    const turmasProcessadas: TurmaParaAlocacao[] = turmasRaw.map((turma) => {
      // TODO: Aqui será integrado com dados reais de alocação
      // Por enquanto, usar dados mock para demonstração
      const statusAlocacao = determinarStatusAlocacao(turma)
      const aulasAlocadas = calcularAulasAlocadas(turma)
      const totalAulas = calcularTotalAulas(turma)

      return {
        ...turma,
        statusAlocacao,
        aulasAlocadas,
        totalAulas,
        conflitos: [], // TODO: Implementar detecção de conflitos
        podeSerAlocada: !!turma.professorAlocado && statusAlocacao !== "conflito",
        corStatus: getCorStatus(statusAlocacao),
      }
    })

    // Aplicar filtros específicos de alocação
    const turmasFiltradas = aplicarFiltrosAlocacao(turmasProcessadas, filtros)

    // Agrupar por status
    const porStatus = {
      naoAlocadas: turmasFiltradas.filter(
        (t) => t.statusAlocacao === "nao-alocada",
      ),
      parcialmenteAlocadas: turmasFiltradas.filter(
        (t) => t.statusAlocacao === "parcialmente-alocada",
      ),
      totalmenteAlocadas: turmasFiltradas.filter(
        (t) => t.statusAlocacao === "totalmente-alocada",
      ),
      comConflitos: turmasFiltradas.filter(
        (t) => t.statusAlocacao === "conflito",
      ),
    }

    // Calcular estatísticas
    const total = turmasFiltradas.length
    const estatisticas = {
      totalNaoAlocadas: porStatus.naoAlocadas.length,
      totalParcialmenteAlocadas: porStatus.parcialmenteAlocadas.length,
      totalTotalmenteAlocadas: porStatus.totalmenteAlocadas.length,
      totalComConflitos: porStatus.comConflitos.length,
      percentualAlocado:
        total > 0 ?
          Math.round(
            ((porStatus.totalmenteAlocadas.length +
              porStatus.parcialmenteAlocadas.length) /
              total) *
              100,
          )
        : 0,
    }

    return {
      turmas: turmasFiltradas,
      total,
      porStatus,
      estatisticas,
    }
  }, [turmasRaw, filtros])

  return {
    ...resultado,
    isLoading,
    error,
    isSuccess,
    isFetching,
    refetch,
  }
}

/**
 * Determinar o status de alocação de uma turma
 * TODO: Integrar com dados reais de alocação
 */
function determinarStatusAlocacao(turma: any): TurmaAllocationStatus {
  // Mock implementation - será substituído por lógica real
  if (!turma.professorAlocado) {
    return "nao-alocada"
  }

  // Simular diferentes status baseado no ID da turma
  const id = parseInt(turma.id) || 0
  if (id % 4 === 0) return "totalmente-alocada"
  if (id % 4 === 1) return "parcialmente-alocada"
  if (id % 4 === 2) return "nao-alocada"
  return "conflito"
}

/**
 * Calcular número de aulas já alocadas
 * TODO: Integrar com dados reais de alocação
 */
function calcularAulasAlocadas(turma: any): number {
  // Mock implementation
  const status = determinarStatusAlocacao(turma)
  const totalAulas = calcularTotalAulas(turma)

  switch (status) {
    case "totalmente-alocada":
      return totalAulas
    case "parcialmente-alocada":
      return Math.floor(totalAulas / 2)
    case "nao-alocada":
      return 0
    case "conflito":
      return Math.floor(totalAulas * 0.3)
    default:
      return 0
  }
}

/**
 * Calcular total de aulas que precisam ser alocadas
 * TODO: Integrar com dados reais da disciplina
 */
function calcularTotalAulas(turma: any): number {
  // Mock implementation - normalmente viria da disciplina ofertada
  return turma.disciplinaOfertada?.cargaHoraria || 60 // Assumir 60h como padrão
}

/**
 * Obter cor do status para exibição
 */
function getCorStatus(
  status: TurmaAllocationStatus,
): "green" | "yellow" | "red" | "gray" {
  switch (status) {
    case "totalmente-alocada":
      return "green"
    case "parcialmente-alocada":
      return "yellow"
    case "nao-alocada":
      return "gray"
    case "conflito":
      return "red"
    default:
      return "gray"
  }
}

/**
 * Aplicar filtros específicos de alocação
 */
function aplicarFiltrosAlocacao(
  turmas: TurmaParaAlocacao[],
  filtros: FiltrosTurmasAlocacao,
): TurmaParaAlocacao[] {
  let resultado = [...turmas]

  // Filtrar apenas não alocadas
  if (filtros.somenteNaoAlocadas) {
    resultado = resultado.filter((t) => t.statusAlocacao === "nao-alocada")
  }

  // Filtrar apenas com professor
  if (filtros.somenteComProfessor) {
    resultado = resultado.filter((t) => !!t.professorAlocado)
  }

  // Filtrar por status específicos
  if (filtros.statusAlocacao && filtros.statusAlocacao.length > 0) {
    resultado = resultado.filter((t) =>
      filtros.statusAlocacao!.includes(t.statusAlocacao),
    )
  }

  return resultado
}
