import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  useAlocacoesHorariosControllerCreate,
  useAlocacoesHorariosControllerDelete,
  getAlocacoesHorariosControllerFindManyQueryKey,
} from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import {
  getPropostasHorarioControllerFindDraftAtivaQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
  getPropostasHorarioControllerFindMinhasPropostasQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import { usePeriodosLetivosControllerFindPeriodoAtivo } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { usePropostaDraftAtiva } from "./use-proposta-draft-ativa"
import type {
  CreateAlocacaoHorarioDto,
  AlocacaoHorarioResponseDto,
  TurmaResponseDto,
} from "@/api-generated/model"
import type { DiaSemanaKey } from "../components/schedule-grid-types"

export interface UseScheduleAllocationOptions {
  /** ID da proposta específica (opcional) */
  propostaId?: string
  /** ID do curso para buscar proposta draft ativa */
  cursoId?: string
  /** ID do período letivo para buscar proposta draft ativa */
  periodoId?: string
}

/**
 * Hook simplificado para gerenciar alocações de horários
 *
 * Funcionalidades essenciais:
 * - Criar novas alocações
 * - Remover alocações existentes
 * - Verificar turmas disponíveis (validação básica)
 * - Invalidar cache para atualizar a UI
 */
export function useScheduleAllocation(
  options: UseScheduleAllocationOptions = {},
) {
  const { propostaId, cursoId, periodoId } = options
  const queryClient = useQueryClient()

  // Mutations para alocações
  const createAlocacaoMutation = useAlocacoesHorariosControllerCreate()
  const deleteAlocacaoMutation = useAlocacoesHorariosControllerDelete()

  // Buscar período ativo
  const { data: periodoAtivo } = usePeriodosLetivosControllerFindPeriodoAtivo()

  // Hook para proposta draft ativa
  const {
    data: propostaDraftAtiva,
    hasDraftAtiva,
    isLoading: isLoadingDraft,
  } = usePropostaDraftAtiva({
    cursoId,
    periodoId: periodoId || periodoAtivo?.id,
    enabled: Boolean(cursoId && (periodoId || periodoAtivo?.id)),
  })

  // Query para buscar todas as turmas disponíveis
  const { data: turmas = [], isLoading: isLoadingTurmas } =
    useTurmasControllerFindAll(
      {
        idPeriodoLetivo: periodoAtivo?.id,
      },
      {
        query: {
          enabled: !!periodoAtivo?.id,
        },
      },
    )

  /**
   * Mapear DiaSemanaKey para o enum da API
   */
  const mapDiaSemanaToDtoEnum = useCallback(
    (dia: DiaSemanaKey): CreateAlocacaoHorarioDto["diaDaSemana"] => {
      const mapping = {
        SEGUNDA: "SEGUNDA" as const,
        TERCA: "TERCA" as const,
        QUARTA: "QUARTA" as const,
        QUINTA: "QUINTA" as const,
        SEXTA: "SEXTA" as const,
        SABADO: "SABADO" as const,
      }
      return mapping[dia]
    },
    [],
  )

  /**
   * Converter horário string para minutos para comparação
   */
  const horarioParaMinutos = useCallback((horario: string): number => {
    const [horas, minutos] = horario.split(":").map(Number)
    return horas * 60 + minutos
  }, [])

  /**
   * Verificar se dois horários se sobrepõem
   */
  const horariosSesobrepom = useCallback(
    (inicio1: string, fim1: string, inicio2: string, fim2: string): boolean => {
      const inicioMin1 = horarioParaMinutos(inicio1)
      const fimMin1 = horarioParaMinutos(fim1)
      const inicioMin2 = horarioParaMinutos(inicio2)
      const fimMin2 = horarioParaMinutos(fim2)

      return inicioMin1 < fimMin2 && inicioMin2 < fimMin1
    },
    [horarioParaMinutos],
  )

  /**
   * Verificar conflito básico de turma (mesma turma, mesmo dia, mesmo horário)
   */
  const temConflitoBasico = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[],
    ): boolean => {
      return alocacoesExistentes.some(
        (alocacao) =>
          alocacao.idTurma === turma.id &&
          alocacao.diaDaSemana === dia &&
          alocacao.horaInicio === horaInicio &&
          alocacao.horaFim === horaFim,
      )
    },
    [],
  )

  /**
   * Verificar conflito de professor (mesmo professor em horários sobrepostos)
   */
  const temConflitoProfessor = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[],
    ): boolean => {
      if (!turma.professorAlocado) return false

      return alocacoesExistentes.some(
        (alocacao) =>
          alocacao.turma.professorAlocado?.id === turma.professorAlocado?.id &&
          alocacao.diaDaSemana === dia &&
          horariosSesobrepom(
            alocacao.horaInicio,
            alocacao.horaFim,
            horaInicio,
            horaFim,
          ),
      )
    },
    [horariosSesobrepom],
  )

  /**
   * Verificar conflitos de horário (validação completa)
   */
  const verificarConflitos = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[],
    ) => {
      const conflitos = {
        basico: temConflitoBasico(
          turma,
          dia,
          horaInicio,
          horaFim,
          alocacoesExistentes,
        ),
        professor: temConflitoProfessor(
          turma,
          dia,
          horaInicio,
          horaFim,
          alocacoesExistentes,
        ),
        mensagens: [] as string[],
      }

      if (conflitos.basico) {
        conflitos.mensagens.push("Turma já está alocada neste horário")
      }

      if (conflitos.professor) {
        conflitos.mensagens.push(
          `Professor ${turma.professorAlocado?.nome} já tem aula neste horário`,
        )
      }

      return conflitos
    },
    [temConflitoBasico, temConflitoProfessor],
  )

  /**
   * Filtrar turmas disponíveis com validações robustas
   */
  const getTurmasDisponiveis = useCallback(
    (
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[] = [],
    ) => {
      return turmas.filter((turma) => {
        // 1. Deve ter professor atribuído
        if (!turma.professorAlocado) {
          return false
        }

        // 2. Verificar conflitos
        const conflitos = verificarConflitos(
          turma,
          dia,
          horaInicio,
          horaFim,
          alocacoesExistentes,
        )

        // 3. Retornar apenas turmas sem conflitos
        return !conflitos.basico && !conflitos.professor
      })
    },
    [turmas, verificarConflitos],
  )

  /**
   * Obter informações de conflitos para uma turma específica
   */
  const getConflitosParaTurma = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[] = [],
    ) => {
      return verificarConflitos(
        turma,
        dia,
        horaInicio,
        horaFim,
        alocacoesExistentes,
      )
    },
    [verificarConflitos],
  )

  /**
   * Invalidar cache básico
   */
  const invalidateCache = useCallback(async () => {
    console.log("🔄 [invalidateCache] Iniciando invalidação com parâmetros:", {
      cursoId,
      periodoId,
      periodoAtivoId: periodoAtivo?.id,
    })

    await Promise.all([
      // Invalidar todas as queries de alocações (diferentes variações)
      queryClient.invalidateQueries({
        queryKey: getAlocacoesHorariosControllerFindManyQueryKey({}),
      }),
      // Invalidar queries mais amplas para garantir atualização
      queryClient.invalidateQueries({
        queryKey: ["alocações-de-horário"], // Invalidar namespace completo
      }),
      // Invalidar propostas
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindAllQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindMinhasPropostasQueryKey(),
      }),
      // Invalidar draft ativa se disponível
      ...(cursoId && (periodoId || periodoAtivo?.id) ?
        [
          queryClient.invalidateQueries({
            queryKey: getPropostasHorarioControllerFindDraftAtivaQueryKey({
              idCurso: cursoId,
              idPeriodoLetivo: periodoId || periodoAtivo?.id || "",
            }),
          }),
        ]
      : []),
    ])

    console.log("✅ [invalidateCache] Invalidação concluída")
  }, [queryClient, cursoId, periodoId, periodoAtivo?.id])

  /**
   * Criar nova alocação (simplificado)
   */
  const criarAlocacao = useCallback(
    async (
      idTurma: string,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
    ) => {
      console.log("🚀 [useScheduleAllocation] Iniciando criação de alocação:", {
        idTurma,
        dia,
        horaInicio,
        horaFim,
      })

      const createData: CreateAlocacaoHorarioDto = {
        idTurma,
        diaDaSemana: mapDiaSemanaToDtoEnum(dia),
        horaInicio,
        horaFim,
      }

      try {
        console.log(
          "⏳ [useScheduleAllocation] Chamando API para criar alocação...",
        )
        const result = await createAlocacaoMutation.mutateAsync({
          data: createData,
        })
        console.log(
          "✅ [useScheduleAllocation] Alocação criada com sucesso:",
          result,
        )

        // Buscar dados da turma para feedback específico
        const turmaInfo = turmas.find((t) => t.id === idTurma)
        const disciplinaNome =
          turmaInfo?.disciplinaOfertada?.disciplina?.nome || "Disciplina"
        const turmaCode = turmaInfo?.codigoDaTurma || "Turma"

        toast.success("✅ Alocação criada!", {
          description: `${disciplinaNome} (${turmaCode}) agendada para ${dia.toLowerCase()}, ${horaInicio}-${horaFim}`,
        })

        console.log("🔄 [useScheduleAllocation] Invalidando cache...")
        await invalidateCache()
        console.log("✅ [useScheduleAllocation] Cache invalidado")

        return result
      } catch (error) {
        console.error("❌ [useScheduleAllocation] Erro ao criar alocação:", error)

        const errorMessage =
          error instanceof Error && error.message.includes("conflict") ?
            "Não é possível alocar: há conflitos de horário ou professor."
          : "Não foi possível criar a alocação. Verifique se todos os dados estão corretos."

        toast.error("❌ Falha na alocação", {
          description: errorMessage,
        })
        throw error
      }
    },
    [createAlocacaoMutation, mapDiaSemanaToDtoEnum, invalidateCache],
  )

  /**
   * Remover alocação existente
   */
  const removerAlocacao = useCallback(
    async (alocacaoId: string) => {
      try {
        await deleteAlocacaoMutation.mutateAsync({ id: alocacaoId })

        toast.success("🗑️ Alocação removida", {
          description:
            "O horário foi liberado e está disponível para nova alocação.",
        })

        await invalidateCache()
        return true
      } catch (error) {
        console.error("Erro ao remover alocação:", error)

        const errorMessage =
          error instanceof Error && error.message.includes("404") ?
            "Esta alocação não foi encontrada. Ela pode já ter sido removida."
          : "Não foi possível remover a alocação. Tente novamente em alguns instantes."

        toast.error("❌ Falha na remoção", {
          description: errorMessage,
        })
        throw error
      }
    },
    [deleteAlocacaoMutation, invalidateCache],
  )

  return {
    // Data
    turmas,
    isLoadingTurmas,

    // States das mutations
    isCreating: createAlocacaoMutation.isPending,
    isDeleting: deleteAlocacaoMutation.isPending,

    // Functions
    getTurmasDisponiveis,
    getConflitosParaTurma,
    criarAlocacao,
    removerAlocacao,

    // Validation helpers
    verificarConflitos,
    horariosSesobrepom,

    // Period data
    periodoAtivo,

    // Draft proposta integration
    propostaDraftAtiva,
    hasDraftAtiva,
    isLoadingDraft,

    // Status
    activePropostaId: propostaDraftAtiva?.id || propostaId,
  }
}
