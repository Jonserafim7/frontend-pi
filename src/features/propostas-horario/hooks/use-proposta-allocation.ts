import { useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  useAlocacoesHorariosControllerCreate,
  useAlocacoesHorariosControllerDelete,
  useAlocacoesHorariosControllerValidate,
  getAlocacoesHorariosControllerFindByPropostaQueryKey,
  getAlocacoesHorariosControllerFindManyQueryKey,
} from "@/api-generated/client/alocações-de-horário/alocações-de-horário"
import {
  getPropostasHorarioControllerFindOneQueryKey,
  getPropostasHorarioControllerFindAllQueryKey,
} from "@/api-generated/client/propostas-horario/propostas-horario"
import { useTurmasControllerFindAll } from "@/api-generated/client/turmas/turmas"
import { usePropostaHorario } from "./use-propostas-horario"
import type {
  CreateAlocacaoHorarioDto,
  ValidateAlocacaoDto,
  AlocacaoHorarioResponseDto,
  TurmaResponseDto,
} from "@/api-generated/model"
import type { DiaSemanaKey } from "../types/proposta-allocation-types"
import { toast } from "sonner"

interface UsePropostaAllocationProps {
  propostaId: string
}

/**
 * Hook específico para gerenciar alocações dentro do contexto de uma proposta de horário.
 *
 * Diferenças do hook geral:
 * - Associa automaticamente alocações à proposta
 * - Filtra turmas do curso/período da proposta
 * - Valida permissões baseadas no status da proposta
 * - Invalida caches específicos da proposta
 * - Integra com validações de negócio específicas
 */
export function usePropostaAllocation({
  propostaId,
}: UsePropostaAllocationProps) {
  const queryClient = useQueryClient()

  // Buscar dados da proposta para validações
  const { data: proposta, isLoading: isLoadingProposta } =
    usePropostaHorario(propostaId)

  // 🔍 Debug: Log dados da proposta
  useEffect(() => {
    if (proposta) {
      console.log("🎯 [usePropostaAllocation] Proposta carregada:", {
        id: proposta.id,
        curso: proposta.curso?.nome,
        cursoId: proposta.curso?.id,
        periodo: `${proposta.periodoLetivo?.ano}/${proposta.periodoLetivo?.semestre}`,
        periodoId: proposta.periodoLetivo?.id,
        status: proposta.status,
        alocacoes: proposta.quantidadeAlocacoes,
      })
    }
  }, [proposta])

  // Mutations para alocações
  const createAlocacaoMutation = useAlocacoesHorariosControllerCreate()
  const deleteAlocacaoMutation = useAlocacoesHorariosControllerDelete()
  const validateAlocacaoMutation = useAlocacoesHorariosControllerValidate()

  // Query para buscar todas as turmas do sistema
  const { data: todasTurmas = [], isLoading: isLoadingTurmas } =
    useTurmasControllerFindAll({})

  /**
   * Filtrar turmas que pertencem ao curso e período da proposta
   */
  const turmasDaProposta = useCallback(() => {
    if (!proposta || !todasTurmas.length) return []

    const turmasFiltradas = todasTurmas.filter((turma) => {
      // Turma deve ser do mesmo período letivo da proposta
      const pertenceAoPeriodo =
        turma.disciplinaOfertada?.idPeriodoLetivo === proposta.periodoLetivo.id

      // TODO: Adicionar validação de curso quando disponível na estrutura de dados
      // const pertenceAoCurso = turma.disciplinaOfertada?.idCurso === proposta.curso.id

      return pertenceAoPeriodo
    })

    // 🔍 Debug: Log filtros de turmas
    console.log("📚 [usePropostaAllocation] Filtro de turmas:", {
      totalTurmas: todasTurmas.length,
      turmasFiltradasProposta: turmasFiltradas.length,
      periodoLetivoProposta: proposta.periodoLetivo.id,
      amostraTurmas: turmasFiltradas.slice(0, 3).map((t) => ({
        codigo: t.codigoDaTurma,
        disciplina: t.disciplinaOfertada?.disciplina?.nome,
        professor: t.professorAlocado?.nome,
        periodoId: t.disciplinaOfertada?.idPeriodoLetivo,
      })),
    })

    return turmasFiltradas
  }, [proposta, todasTurmas])

  /**
   * Verificar se a proposta permite edição baseada no status
   */
  const podeEditarProposta = useCallback(() => {
    if (!proposta) return false
    return proposta.status === "DRAFT"
  }, [proposta])

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
      const converterParaMinutos = (horario: string): number => {
        const [horas, minutos] = horario.split(":").map(Number)
        return horas * 60 + minutos
      }

      const inicio1Min = converterParaMinutos(inicio1)
      const fim1Min = converterParaMinutos(fim1)
      const inicio2Min = converterParaMinutos(inicio2)
      const fim2Min = converterParaMinutos(fim2)

      return !(fim1Min <= inicio2Min || fim2Min <= inicio1Min)
    },
    [],
  )

  /**
   * Verificar conflitos de horário para uma turma específica dentro da proposta
   */
  const temConflitoHorario = useCallback(
    (
      turma: TurmaResponseDto,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesDaProposta: AlocacaoHorarioResponseDto[],
    ): { temConflito: boolean; motivo?: string } => {
      // 1. Verificar se a turma já está alocada em outro horário no mesmo dia (na proposta)
      const alocacoesTurmaMesmoDia = alocacoesDaProposta.filter(
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
            motivo: `Turma ${turma.codigoDaTurma} já está alocada das ${alocacao.horaInicio} às ${alocacao.horaFim} nesta proposta`,
          }
        }
      }

      // 2. Verificar se o professor já está alocado em outro horário no mesmo dia/horário (na proposta)
      if (turma.professorAlocado) {
        const alocacoesProfessorMesmoDiaHorario = alocacoesDaProposta.filter(
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
              motivo: `Professor ${turma.professorAlocado.nome} já está alocado das ${alocacao.horaInicio} às ${alocacao.horaFim} com a turma ${alocacao.turma.codigoDaTurma} nesta proposta`,
            }
          }
        }
      }

      return { temConflito: false }
    },
    [temSobreposicaoHorario],
  )

  /**
   * Filtrar turmas disponíveis para o slot, considerando apenas turmas da proposta
   */
  const getTurmasDisponiveis = useCallback(
    (
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
      alocacoesExistentes: AlocacaoHorarioResponseDto[] = [],
      alocacoesDaProposta: AlocacaoHorarioResponseDto[] = [],
    ) => {
      if (!podeEditarProposta()) return []

      const turmasValidasDaProposta = turmasDaProposta()

      // IDs das turmas já alocadas neste slot específico
      const turmasAlocadasIds = new Set(
        alocacoesExistentes.map((alocacao) => alocacao.idTurma),
      )

      const turmasDisponiveis = turmasValidasDaProposta.filter((turma) => {
        // 1. Não pode estar já alocada neste slot
        if (turmasAlocadasIds.has(turma.id)) {
          return false
        }

        // 2. Deve ter professor atribuído
        if (!turma.professorAlocado) {
          return false
        }

        // 3. Verificar conflitos de horário dentro da proposta
        const { temConflito } = temConflitoHorario(
          turma,
          dia,
          horaInicio,
          horaFim,
          alocacoesDaProposta,
        )

        return !temConflito
      })

      // 🔍 Debug: Log turmas disponíveis para slot
      console.log(
        `🎲 [usePropostaAllocation] Turmas disponíveis ${dia} ${horaInicio}:`,
        {
          totalTurmasDaProposta: turmasValidasDaProposta.length,
          turmasJaAlocadas: alocacoesExistentes.length,
          turmasDisponiveis: turmasDisponiveis.length,
          podeEditar: podeEditarProposta(),
          amostraTurmasDisponiveis: turmasDisponiveis.slice(0, 3).map((t) => ({
            codigo: t.codigoDaTurma,
            professor: t.professorAlocado?.nome,
          })),
        },
      )

      return turmasDisponiveis
    },
    [podeEditarProposta, turmasDaProposta, temConflitoHorario],
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
   * Criar nova alocação associada à proposta
   */
  const criarAlocacao = useCallback(
    async (
      idTurma: string,
      dia: DiaSemanaKey,
      horaInicio: string,
      horaFim: string,
    ) => {
      if (!podeEditarProposta()) {
        throw new Error("Proposta não pode ser editada no status atual")
      }

      // Primeiro validar a alocação
      const validation = await validateAlocacao(idTurma, dia, horaInicio, horaFim)

      if (!validation.valid) {
        throw new Error(validation.error || "Alocação inválida")
      }

      const createData: CreateAlocacaoHorarioDto = {
        idTurma,
        idPropostaHorario: propostaId, // ← ASSOCIA À PROPOSTA
        diaDaSemana: mapDiaSemanaToDtoEnum(dia),
        horaInicio,
        horaFim,
      }

      try {
        console.log("🚀 [usePropostaAllocation] Criando alocação:", {
          turma: idTurma,
          proposta: propostaId,
          slot: `${dia} ${horaInicio}-${horaFim}`,
        })

        const result = await createAlocacaoMutation.mutateAsync({
          data: createData,
        })

        console.log(
          "✅ [usePropostaAllocation] Alocação criada, resultado:",
          result,
        )

        // 🔄 Invalidar caches específicos da proposta
        console.log("🔄 [usePropostaAllocation] Invalidando caches...")

        await Promise.all([
          // Invalidar alocações específicas da proposta
          queryClient.invalidateQueries({
            queryKey:
              getAlocacoesHorariosControllerFindByPropostaQueryKey(propostaId),
          }),
          // Invalidar todas as alocações
          queryClient.invalidateQueries({
            queryKey: getAlocacoesHorariosControllerFindManyQueryKey({}),
          }),
          // ✅ CORREÇÃO: Invalidar a proposta específica para atualizar quantidadeAlocacoes
          queryClient.invalidateQueries({
            queryKey: getPropostasHorarioControllerFindOneQueryKey(propostaId),
          }),
          // ✅ CORREÇÃO: Invalidar lista de propostas para atualizar contadores gerais
          queryClient.invalidateQueries({
            queryKey: getPropostasHorarioControllerFindAllQueryKey(),
          }),
        ])

        console.log("✅ [usePropostaAllocation] Caches invalidados com sucesso!")

        toast.success("Alocação criada com sucesso!")
        return result
      } catch (error) {
        console.error("❌ [usePropostaAllocation] Erro ao criar alocação:", error)
        toast.error("Erro ao criar alocação")
        throw error
      }
    },
    [
      podeEditarProposta,
      validateAlocacao,
      createAlocacaoMutation,
      mapDiaSemanaToDtoEnum,
      propostaId,
      queryClient,
    ],
  )

  /**
   * Remover alocação existente
   */
  const removerAlocacao = useCallback(
    async (alocacaoId: string) => {
      if (!podeEditarProposta()) {
        throw new Error("Proposta não pode ser editada no status atual")
      }

      try {
        console.log("🗑️ [usePropostaAllocation] Removendo alocação:", alocacaoId)

        await deleteAlocacaoMutation.mutateAsync({ id: alocacaoId })

        console.log("✅ [usePropostaAllocation] Alocação removida")

        // 🔄 Invalidar caches específicos da proposta
        console.log(
          "🔄 [usePropostaAllocation] Invalidando caches após remoção...",
        )

        await Promise.all([
          // Invalidar alocações específicas da proposta
          queryClient.invalidateQueries({
            queryKey:
              getAlocacoesHorariosControllerFindByPropostaQueryKey(propostaId),
          }),
          // Invalidar todas as alocações
          queryClient.invalidateQueries({
            queryKey: getAlocacoesHorariosControllerFindManyQueryKey({}),
          }),
          // ✅ CORREÇÃO: Invalidar a proposta específica para atualizar quantidadeAlocacoes
          queryClient.invalidateQueries({
            queryKey: getPropostasHorarioControllerFindOneQueryKey(propostaId),
          }),
          // ✅ CORREÇÃO: Invalidar lista de propostas para atualizar contadores gerais
          queryClient.invalidateQueries({
            queryKey: getPropostasHorarioControllerFindAllQueryKey(),
          }),
        ])

        console.log("✅ [usePropostaAllocation] Caches invalidados após remoção!")

        toast.success("Alocação removida com sucesso!")
        return true
      } catch (error) {
        console.error(
          "❌ [usePropostaAllocation] Erro ao remover alocação:",
          error,
        )
        toast.error("Erro ao remover alocação")
        throw error
      }
    },
    [podeEditarProposta, deleteAlocacaoMutation, queryClient, propostaId],
  )

  return {
    // Data
    proposta,
    turmasDaProposta: turmasDaProposta(),
    podeEditarProposta: podeEditarProposta(),

    // Loading states
    isLoadingProposta,
    isLoadingTurmas,
    isCreating: createAlocacaoMutation.isPending,
    isDeleting: deleteAlocacaoMutation.isPending,
    isValidating: validateAlocacaoMutation.isPending,

    // Functions
    getTurmasDisponiveis,
    validateAlocacao,
    criarAlocacao,
    removerAlocacao,

    // Utility functions
    temSobreposicaoHorario,
    temConflitoHorario,
  }
}
