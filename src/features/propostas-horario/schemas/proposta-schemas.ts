import { z } from "zod"
import {
  propostasHorarioControllerCreateBody,
  propostasHorarioControllerUpdateBody,
  propostasHorarioControllerSubmitBody,
  propostasHorarioControllerApproveBody,
  propostasHorarioControllerRejectBody,
} from "@/api-generated/zod-schemas/propostas-horario/propostas-horario"

/**
 * Schema para criação de nova proposta
 * Baseado no schema gerado pelo Orval com validações adicionais
 */
export const createPropostaFormSchema = propostasHorarioControllerCreateBody
  .extend({
    // Validações adicionais específicas para o formulário
    idCurso: z
      .string()
      .min(1, "Selecione um curso")
      .uuid("ID do curso deve ser um UUID válido"),
    idPeriodoLetivo: z
      .string()
      .min(1, "Selecione um período letivo")
      .uuid("ID do período letivo deve ser um UUID válido"),
    observacoesCoordenador: z
      .string()
      .max(1000, "Observações devem ter no máximo 1000 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      // Validação personalizada: não pode selecionar o mesmo curso e período
      // se já existir uma proposta DRAFT ou PENDENTE (será validado no backend)
      return true
    },
    {
      message: "Já existe uma proposta para este curso e período letivo",
      path: ["idCurso"],
    },
  )

export type CreatePropostaFormData = z.infer<typeof createPropostaFormSchema>

/**
 * Schema para atualização de proposta
 * Baseado no schema gerado pelo Orval
 */
export const updatePropostaFormSchema =
  propostasHorarioControllerUpdateBody.extend({
    observacoesCoordenador: z
      .string()
      .max(1000, "Observações devem ter no máximo 1000 caracteres")
      .optional(),
  })

export type UpdatePropostaFormData = z.infer<typeof updatePropostaFormSchema>

/**
 * Schema para submissão de proposta
 * Baseado no schema gerado pelo Orval com validações adicionais
 */
export const submitPropostaFormSchema =
  propostasHorarioControllerSubmitBody.extend({
    observacoesCoordenador: z
      .string()
      .max(1000, "Observações devem ter no máximo 1000 caracteres")
      .optional(),
    // Campo adicional para confirmação (não enviado para API)
    confirmaSubmissao: z.boolean().refine((val) => val === true, {
      message: "Você deve confirmar a submissão da proposta",
    }),
  })

export type SubmitPropostaFormData = z.infer<typeof submitPropostaFormSchema>

/**
 * Schema para aprovação de proposta pelo diretor
 * Baseado no schema gerado pelo Orval
 */
export const approvePropostaFormSchema =
  propostasHorarioControllerApproveBody.extend({
    observacoesDiretor: z
      .string()
      .max(1000, "Observações devem ter no máximo 1000 caracteres")
      .optional(),
    // Campo adicional para confirmação (não enviado para API)
    confirmaAprovacao: z.boolean().refine((val) => val === true, {
      message: "Você deve confirmar a aprovação da proposta",
    }),
  })

export type ApprovePropostaFormData = z.infer<typeof approvePropostaFormSchema>

/**
 * Schema para rejeição de proposta pelo diretor
 * Baseado no schema gerado pelo Orval com validações mais rigorosas
 */
export const rejectPropostaFormSchema =
  propostasHorarioControllerRejectBody.extend({
    justificativaRejeicao: z
      .string()
      .min(10, "Justificativa deve ter pelo menos 10 caracteres")
      .max(2000, "Justificativa deve ter no máximo 2000 caracteres")
      .refine(
        (val) => val.trim().length >= 10,
        "Justificativa não pode ser apenas espaços em branco",
      ),
    observacoesDiretor: z
      .string()
      .max(1000, "Observações devem ter no máximo 1000 caracteres")
      .optional(),
    // Campo adicional para confirmação (não enviado para API)
    confirmaRejeicao: z.boolean().refine((val) => val === true, {
      message: "Você deve confirmar a rejeição da proposta",
    }),
  })

export type RejectPropostaFormData = z.infer<typeof rejectPropostaFormSchema>

/**
 * Schema para filtros da listagem de propostas
 */
export const propostaFiltersSchema = z
  .object({
    status: z
      .array(z.enum(["DRAFT", "PENDENTE_APROVACAO", "APROVADA", "REJEITADA"]))
      .optional(),
    cursoId: z.string().uuid().optional(),
    coordenadorId: z.string().uuid().optional(),
    periodoLetivoId: z.string().uuid().optional(),
    dataInicio: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Data de início deve ser uma data válida",
      })
      .optional(),
    dataFim: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Data de fim deve ser uma data válida",
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.dataInicio && data.dataFim) {
        return new Date(data.dataInicio) <= new Date(data.dataFim)
      }
      return true
    },
    {
      message: "Data de início deve ser anterior à data de fim",
      path: ["dataFim"],
    },
  )

export type PropostaFiltersFormData = z.infer<typeof propostaFiltersSchema>

/**
 * Schema para ordenação da listagem
 */
export const propostaSortSchema = z.object({
  field: z.enum([
    "dataCriacao",
    "dataAtualizacao",
    "dataSubmissao",
    "dataAprovacaoRejeicao",
    "curso.nome",
    "coordenadorQueSubmeteu.nome",
    "status",
  ]),
  direction: z.enum(["asc", "desc"]),
})

export type PropostaSortFormData = z.infer<typeof propostaSortSchema>

/**
 * Schema para busca/pesquisa na listagem
 */
export const propostaSearchSchema = z.object({
  query: z
    .string()
    .max(100, "Termo de busca deve ter no máximo 100 caracteres")
    .optional(),
  searchFields: z
    .array(
      z.enum([
        "curso.nome",
        "coordenadorQueSubmeteu.nome",
        "observacoesCoordenador",
      ]),
    )
    .default(["curso.nome", "coordenadorQueSubmeteu.nome"])
    .optional(),
})

export type PropostaSearchFormData = z.infer<typeof propostaSearchSchema>

/**
 * Schema combinado para formulário completo de filtros + busca + ordenação
 */
export const propostaListFiltersSchema = z.object({
  filters: propostaFiltersSchema.optional(),
  sort: propostaSortSchema.optional(),
  search: propostaSearchSchema.optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(10),
})

export type PropostaListFiltersFormData = z.infer<
  typeof propostaListFiltersSchema
>

/**
 * Schema para reabertura de proposta rejeitada
 */
export const reopenPropostaFormSchema = z.object({
  // Campo adicional para confirmação (não enviado para API)
  confirmaReabertura: z.boolean().refine((val) => val === true, {
    message: "Você deve confirmar a reabertura da proposta",
  }),
  motivoReabertura: z
    .string()
    .min(10, "Motivo deve ter pelo menos 10 caracteres")
    .max(500, "Motivo deve ter no máximo 500 caracteres")
    .optional(),
})

export type ReopenPropostaFormData = z.infer<typeof reopenPropostaFormSchema>

/**
 * Schema para devolução de proposta aprovada para edição
 */
export const sendBackPropostaFormSchema = z.object({
  motivoDevolucao: z
    .string()
    .min(10, "O motivo deve ter pelo menos 10 caracteres")
    .max(500, "O motivo não pode exceder 500 caracteres")
    .refine(
      (val) => val.trim().length >= 10,
      "O motivo não pode ser apenas espaços em branco",
    ),
  // Campo adicional para confirmação (não enviado para API)
  confirmaDevolucao: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você deve confirmar a devolução da proposta",
    })
    .optional(),
})

export type SendBackPropostaFormData = z.infer<typeof sendBackPropostaFormSchema>

/**
 * Schema para seleção de curso (usado em dropdowns/selects)
 */
export const cursoSelectSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1),
  codigo: z.string().optional(),
  // Campos adicionais para UI
  isActive: z.boolean().default(true),
  isCoordenadorResponsavel: z.boolean().default(false),
})

export type CursoSelectData = z.infer<typeof cursoSelectSchema>

/**
 * Schema para seleção de período letivo (usado em dropdowns/selects)
 */
export const periodoLetivoSelectSchema = z.object({
  id: z.string().uuid(),
  ano: z.number().int().min(2020).max(2030),
  semestre: z.number().int().min(1).max(2),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  // Campos adicionais para UI
  descricao: z.string(), // "2024/1"
  isActive: z.boolean().default(true),
  isAtivo: z.boolean().default(true),
})

export type PeriodoLetivoSelectData = z.infer<typeof periodoLetivoSelectSchema>

/**
 * Utilitários de validação customizadas
 */
export const validationUtils = {
  /**
   * Valida se uma data está no futuro
   */
  isFutureDate: (date: string) => new Date(date) > new Date(),

  /**
   * Valida se uma data está dentro de um período letivo
   */
  isDateInPeriod: (date: string, inicio: string, fim: string) => {
    const checkDate = new Date(date)
    return checkDate >= new Date(inicio) && checkDate <= new Date(fim)
  },

  /**
   * Valida se dois períodos não se sobrepõem
   */
  periodsDoNotOverlap: (
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ) => {
    return new Date(end1) < new Date(start2) || new Date(end2) < new Date(start1)
  },
}

/**
 * Mensagens de erro padronizadas
 */
export const validationMessages = {
  required: "Este campo é obrigatório",
  invalidUuid: "ID deve ser um UUID válido",
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
  invalidDate: "Data inválida",
  futureDate: "Data deve estar no futuro",
  pastDate: "Data deve estar no passado",
  invalidEmail: "Email inválido",
  confirmationRequired: "Confirmação é obrigatória",
  duplicateNotAllowed: "Já existe um registro com estes dados",
} as const
