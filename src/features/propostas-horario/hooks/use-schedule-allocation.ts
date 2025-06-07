import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  useAlocacoesHorariosControllerCreate,
  useAlocacoesHorariosControllerDelete,
  useAlocacoesHorariosControllerValidate,
  getAlocacoesHorariosControllerFindManyQueryKey,
} from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import {
  getPropostasHorarioControllerFindDraftAtivaQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
  getPropostasHorarioControllerFindMinhasPropostasQueryKey,
  getPropostasHorarioControllerFindOneQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import { usePeriodosLetivosControllerFindPeriodoAtivo } from "@/api-generated/client/períodos-letivos/períodos-letivos"
import { useDisponibilidadeProfessorControllerFindByPeriodo } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { usePropostaDraftAtiva } from "./use-proposta-draft-ativa"
import { useAuth } from "@/features/auth/contexts/auth-context"
import type {
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoDto,
  AlocacaoHorarioResponseDto,
  TurmaResponseDto,
  DisponibilidadeResponseDto,
} from "@/api-generated/model"
import type { DiaSemanaKey } from "../components/schedule-grid-types"

export interface UseScheduleAllocationOptions {
  /**
   * ID da proposta específica (opcional)
   */
  propostaId?: string
  /**
   * ID do curso para buscar proposta draft ativa
   */
  cursoId?: string
  /**
   * ID do período letivo para buscar proposta draft ativa
   */
  periodoId?: string
}

/**
 * Hook customizado para gerenciar alocações de horários com validações completas.
 *
 * Fornece funções para:
 * - Buscar turmas disponíveis
 * - Criar novas alocações com auto-associação a propostas draft
 * - Remover alocações existentes
 * - Validar conflitos antes de alocar
 * - Verificar disponibilidade de professores
 * - Invalidar cache para atualizar a UI (incluindo propostas)
 */
export function useScheduleAllocation(
  options: UseScheduleAllocationOptions = {},
) {
  const { propostaId, cursoId, periodoId } = options
  const queryClient = useQueryClient()
  const { isCoordenador } = useAuth()

  // Mutations para alocações
  const createAlocacaoMutation = useAlocacoesHorariosControllerCreate()
  const deleteAlocacaoMutation = useAlocacoesHorariosControllerDelete()
  const validateAlocacaoMutation = useAlocacoesHorariosControllerValidate()

  // Buscar período ativo
  const { data: periodoAtivo } = usePeriodosLetivosControllerFindPeriodoAtivo()

  // Hook para proposta draft ativa (apenas para coordenadores)
  const {
    data: propostaDraftAtiva,
    hasDraftAtiva,
    isLoading: isLoadingDraft,
    invalidate: invalidateDraft,
  } = usePropostaDraftAtiva({
    cursoId,
    periodoId: periodoId || periodoAtivo?.id,
    enabled:
      isCoordenador() && Boolean(cursoId && (periodoId || periodoAtivo?.id)),
  })

  // Buscar disponibilidades do período ativo
  const { data: disponibilidades = [], isLoading: isLoadingDisponibilidades } =
    useDisponibilidadeProfessorControllerFindByPeriodo(
      periodoAtivo?.id || "",
      {
        status: "DISPONIVEL",
      },
      {
        query: {
          enabled: !!periodoAtivo?.id,
        },
      },
    )

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
   * Verificar se dois horários têm sobreposição
   */
  const temSobreposicaoHorario = useCallback(
    (inicio1: string, fim1: string, inicio2: string, fim2: string): boolean => {
      // Converter horários para minutos para facilitar comparação
      const converterParaMinutos = (horario: string): number => {
        const [horas, minutos] = horario.split(":").map(Number)
        return horas * 60 + minutos
      }

      const inicio1Min = converterParaMinutos(inicio1)
      const fim1Min = converterParaMinutos(fim1)
      const inicio2Min = converterParaMinutos(inicio2)
      const fim2Min = converterParaMinutos(fim2)

      // Verificar sobreposição: não há sobreposição se um termina antes do outro começar
      return !(fim1Min <= inicio2Min || fim2Min <= inicio1Min)
    },
    [],
  )

  /**
   * Verificar conflitos de horário para uma turma específica
   */
  const temConflitoHorario = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      todasAlocacoes: AlocacaoHorarioResponseDto[],
    ): { temConflito: boolean; motivo?: string } => {
      // 1. Verificar se a turma já está alocada em outro horário no mesmo dia
      const alocacoesTurmaMesmoDia = todasAlocacoes.filter(
        (alocacao) =>
          alocacao.idTurma === turma.id && alocacao.diaDaSemana === dia,
      )

      for (const alocacao of alocacoesTurmaMesmoDia) {
        if (
          temSobreposicaoHorario(
            horaInicio,
            horaFim,
            alocacao.horaInicio,
            alocacao.horaFim,
          )
        ) {
          return {
            temConflito: true,
            motivo: `Turma ${turma.codigoDaTurma} já está alocada das ${alocacao.horaInicio} às ${alocacao.horaFim}`,
          }
        }
      }

      // 2. Verificar se o professor já está alocado em outro horário no mesmo dia/horário
      if (turma.professorAlocado) {
        const alocacoesProfessorMesmoDiaHorario = todasAlocacoes.filter(
          (alocacao) =>
            alocacao.turma.professorAlocado?.id === turma.professorAlocado?.id &&
            alocacao.diaDaSemana === dia,
        )

        for (const alocacao of alocacoesProfessorMesmoDiaHorario) {
          if (
            temSobreposicaoHorario(
              horaInicio,
              horaFim,
              alocacao.horaInicio,
              alocacao.horaFim,
            )
          ) {
            return {
              temConflito: true,
              motivo: `Professor ${turma.professorAlocado.nome} já está alocado das ${alocacao.horaInicio} às ${alocacao.horaFim} com a turma ${alocacao.turma.codigoDaTurma}`,
            }
          }
        }
      }

      return { temConflito: false }
    },
    [temSobreposicaoHorario],
  )

  /**
   * Filtrar turmas que não possuem conflitos para o slot especificado
   */
  const getTurmasDisponiveis = useCallback(
    (
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[] = [],
      todasAlocacoes: AlocacaoHorarioResponseDto[] = [],
    ) => {
      // IDs das turmas já alocadas neste slot específico
      const turmasAlocadasIds = new Set(
        alocacoesExistentes.map((alocacao) => alocacao.idTurma),
      )

      // Filtrar turmas aplicando todas as validações
      return turmas.filter((turma) => {
        // 1. Não pode estar já alocada neste slot
        if (turmasAlocadasIds.has(turma.id)) {
          return false
        }

        // 2. Não pode ter professor sem atribuição
        if (!turma.professorAlocado) {
          return false
        }

        // 3. Verificar se o professor está disponível no horário
        const professorDisponivel = isProfessorDisponivel(
          turma.professorAlocado.id,
          dia,
          horaInicio,
          horaFim,
          disponibilidades,
        )

        if (!professorDisponivel) {
          return false
        }

        // 4. Verificar conflitos de horário
        const { temConflito } = temConflitoHorario(
          turma,
          dia,
          horaInicio,
          horaFim,
          todasAlocacoes,
        )

        return !temConflito
      })
    },
    [turmas, temConflitoHorario, disponibilidades],
  )

  /**
   * Obter motivos pelos quais uma turma não está disponível
   */
  const getMotivosIndisponibilidade = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[] = [],
      todasAlocacoes: AlocacaoHorarioResponseDto[] = [],
    ): string[] => {
      const motivos: string[] = []

      // Verificar se já está alocada neste slot
      const jaAlocadaNesteSlot = alocacoesExistentes.some(
        (alocacao) => alocacao.idTurma === turma.id,
      )
      if (jaAlocadaNesteSlot) {
        motivos.push("Já alocada neste horário")
      }

      // Verificar se tem professor atribuído
      if (!turma.professorAlocado) {
        motivos.push("Professor não atribuído")
      } else {
        // Verificar disponibilidade do professor
        const professorDisponivel = isProfessorDisponivel(
          turma.professorAlocado.id,
          dia,
          horaInicio,
          horaFim,
          disponibilidades,
        )

        if (!professorDisponivel) {
          motivos.push(
            `Professor ${turma.professorAlocado.nome} não está disponível neste horário`,
          )
        }
      }

      // Verificar conflitos de horário
      const { temConflito, motivo } = temConflitoHorario(
        turma,
        dia,
        horaInicio,
        horaFim,
        todasAlocacoes,
      )
      if (temConflito && motivo) {
        motivos.push(motivo)
      }

      return motivos
    },
    [temConflitoHorario, disponibilidades],
  )

  /**
   * Validar se uma turma pode ser alocada no slot
   */
  const validateAlocacao = useCallback(
    async (
      idTurma: string,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
    ) => {
      const validateData: ValidateAlocacaoDto = {
        idTurma,
        diaDaSemana: mapDiaSemanaToDtoEnum(dia),
        horaInicio,
        horaFim,
      }

      try {
        const result = await validateAlocacaoMutation.mutateAsync({
          data: validateData,
        })
        return result
      } catch (error) {
        console.error("Erro ao validar alocação:", error)
        throw error
      }
    },
    [validateAlocacaoMutation, mapDiaSemanaToDtoEnum],
  )

  /**
   * Invalidar todas as queries relacionadas às propostas
   */
  const invalidatePropostasQueries = useCallback(async () => {
    const invalidationPromises = []

    // Invalidar lista geral de propostas
    invalidationPromises.push(
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindAllQueryKey(),
      }),
    )

    // Invalidar minhas propostas
    invalidationPromises.push(
      queryClient.invalidateQueries({
        queryKey: getPropostasHorarioControllerFindMinhasPropostasQueryKey(),
      }),
    )

    // Invalidar proposta draft ativa se disponível
    if (cursoId && (periodoId || periodoAtivo?.id)) {
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: getPropostasHorarioControllerFindDraftAtivaQueryKey({
            idCurso: cursoId,
            idPeriodoLetivo: periodoId || periodoAtivo?.id || "",
          }),
        }),
      )
    }

    // Invalidar proposta específica se fornecida
    if (propostaId || propostaDraftAtiva?.id) {
      const targetPropostaId = propostaId || propostaDraftAtiva?.id
      if (targetPropostaId) {
        invalidationPromises.push(
          queryClient.invalidateQueries({
            queryKey:
              getPropostasHorarioControllerFindOneQueryKey(targetPropostaId),
          }),
        )
      }
    }

    await Promise.all(invalidationPromises)
  }, [
    queryClient,
    cursoId,
    periodoId,
    periodoAtivo?.id,
    propostaId,
    propostaDraftAtiva?.id,
  ])

  /**
   * Criar nova alocação
   */
  const criarAlocacao = useCallback(
    async (
      idTurma: string,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
    ) => {
      // Primeiro validar a alocação
      const validation = await validateAlocacao(idTurma, dia, horaInicio, horaFim)

      if (!validation.valid) {
        throw new Error(validation.error || "Alocação inválida")
      }

      const createData: CreateAlocacaoHorarioDto = {
        idTurma,
        diaDaSemana: mapDiaSemanaToDtoEnum(dia),
        horaInicio,
        horaFim,
      }

      try {
        const result = await createAlocacaoMutation.mutateAsync({
          data: createData,
        })

        // Invalidar cache para atualizar a lista de alocações
        await queryClient.invalidateQueries({
          queryKey: getAlocacoesHorariosControllerFindManyQueryKey({}),
        })

        // Invalidar queries relacionadas às propostas
        await invalidatePropostasQueries()

        return result
      } catch (error) {
        console.error("Erro ao criar alocação:", error)
        throw error
      }
    },
    [
      validateAlocacao,
      createAlocacaoMutation,
      mapDiaSemanaToDtoEnum,
      queryClient,
      invalidatePropostasQueries,
    ],
  )

  /**
   * Remover alocação existente
   */
  const removerAlocacao = useCallback(
    async (alocacaoId: string) => {
      try {
        await deleteAlocacaoMutation.mutateAsync({ id: alocacaoId })

        // Invalidar cache para atualizar a lista de alocações
        await queryClient.invalidateQueries({
          queryKey: getAlocacoesHorariosControllerFindManyQueryKey({}),
        })

        // Invalidar queries relacionadas às propostas
        await invalidatePropostasQueries()

        return true
      } catch (error) {
        console.error("Erro ao remover alocação:", error)
        throw error
      }
    },
    [deleteAlocacaoMutation, queryClient, invalidatePropostasQueries],
  )

  /**
   * Verifica se um professor está disponível em um horário específico
   */
  function isProfessorDisponivel(
    professorId: string,
    diaSemana: DiaSemanaKey,
    horaInicio: string,
    horaFim: string,
    disponibilidades: DisponibilidadeResponseDto[],
  ): boolean {
    const disponibilidade = disponibilidades.find(
      (d) =>
        d.usuarioProfessor.id === professorId &&
        d.diaDaSemana === diaSemana &&
        d.horaInicio <= horaInicio &&
        d.horaFim >= horaFim &&
        d.status === "DISPONIVEL",
    )

    return !!disponibilidade
  }

  return {
    // Data
    turmas,
    isLoadingTurmas,

    // States das mutations
    isCreating: createAlocacaoMutation.isPending,
    isDeleting: deleteAlocacaoMutation.isPending,
    isValidating: validateAlocacaoMutation.isPending,

    // Functions
    getTurmasDisponiveis,
    getMotivosIndisponibilidade,
    validateAlocacao,
    criarAlocacao,
    removerAlocacao,

    // Utility functions
    temSobreposicaoHorario,
    temConflitoHorario,

    // Period and availability data
    periodoAtivo,
    isLoadingDisponibilidades,
    disponibilidades,

    // Draft proposta integration
    propostaDraftAtiva,
    hasDraftAtiva,
    isLoadingDraft,
    invalidateDraft,
    invalidatePropostasQueries,

    // Proposal-aware status
    isProposalModeEnabled: isCoordenador() && hasDraftAtiva,
    activePropostaId: propostaDraftAtiva?.id || propostaId,
  }
}
