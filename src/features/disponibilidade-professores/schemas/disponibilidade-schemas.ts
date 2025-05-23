import { z } from "zod"

/**
 * Enum para dias da semana
 */
export const DiaSemanaEnum = z.enum([
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
])

/**
 * Enum para status de disponibilidade
 */
export const StatusDisponibilidadeEnum = z.enum(["DISPONIVEL", "INDISPONIVEL"])

/**
 * Schema para validação de horário (HH:mm)
 */
const horarioRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

/**
 * Schema para criação de disponibilidade
 */
export const createDisponibilidadeSchema = z
  .object({
    idUsuarioProfessor: z
      .string()
      .min(1, "ID do professor é obrigatório")
      .uuid("ID do professor deve ser um UUID válido"),
    idPeriodoLetivo: z
      .string()
      .min(1, "ID do período letivo é obrigatório")
      .uuid("ID do período letivo deve ser um UUID válido"),
    diaDaSemana: DiaSemanaEnum,
    horaInicio: z
      .string()
      .regex(
        horarioRegex,
        "Hora de início deve estar no formato HH:mm (ex: 07:30, 14:00)",
      )
      .min(1, "Hora de início é obrigatória"),
    horaFim: z
      .string()
      .regex(
        horarioRegex,
        "Hora de fim deve estar no formato HH:mm (ex: 12:00, 18:30)",
      )
      .min(1, "Hora de fim é obrigatória"),
    status: StatusDisponibilidadeEnum.optional().default("DISPONIVEL"),
  })
  .refine(
    (data) => {
      // Validar se hora de fim é maior que hora de início
      const [horaIni, minIni] = data.horaInicio.split(":").map(Number)
      const [horaFin, minFin] = data.horaFim.split(":").map(Number)

      const inicioMinutos = horaIni * 60 + minIni
      const fimMinutos = horaFin * 60 + minFin

      return fimMinutos > inicioMinutos
    },
    {
      message: "Horário de fim deve ser maior que horário de início",
      path: ["horaFim"],
    },
  )

/**
 * Schema para atualização de disponibilidade
 */
export const updateDisponibilidadeSchema = z
  .object({
    diaDaSemana: DiaSemanaEnum.optional(),
    horaInicio: z
      .string()
      .regex(
        horarioRegex,
        "Hora de início deve estar no formato HH:mm (ex: 07:30, 14:00)",
      )
      .optional(),
    horaFim: z
      .string()
      .regex(
        horarioRegex,
        "Hora de fim deve estar no formato HH:mm (ex: 12:00, 18:30)",
      )
      .optional(),
    status: StatusDisponibilidadeEnum.optional(),
  })
  .refine(
    (data) => {
      // Só validar horários se ambos forem fornecidos
      if (data.horaInicio && data.horaFim) {
        const [horaIni, minIni] = data.horaInicio.split(":").map(Number)
        const [horaFin, minFin] = data.horaFim.split(":").map(Number)

        const inicioMinutos = horaIni * 60 + minIni
        const fimMinutos = horaFin * 60 + minFin

        return fimMinutos > inicioMinutos
      }
      return true
    },
    {
      message: "Horário de fim deve ser maior que horário de início",
      path: ["horaFim"],
    },
  )

/**
 * Schema para query de listagem
 */
export const listarDisponibilidadesQuerySchema = z.object({
  professorId: z.string().uuid().optional(),
  periodoLetivoId: z.string().uuid().optional(),
  diaSemana: DiaSemanaEnum.optional(),
  status: StatusDisponibilidadeEnum.optional(),
  orderBy: z
    .enum(["diaDaSemana", "horaInicio", "horaFim", "dataCriacao"])
    .optional()
    .default("diaDaSemana"),
  orderDirection: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
})

/**
 * Tipos TypeScript derivados dos schemas
 */
export type CreateDisponibilidadeFormData = z.infer<
  typeof createDisponibilidadeSchema
>
export type UpdateDisponibilidadeFormData = z.infer<
  typeof updateDisponibilidadeSchema
>
export type ListarDisponibilidadesQuery = z.infer<
  typeof listarDisponibilidadesQuerySchema
>
export type DiaSemana = z.infer<typeof DiaSemanaEnum>
export type StatusDisponibilidade = z.infer<typeof StatusDisponibilidadeEnum>

/**
 * Constantes úteis
 */
export const DIAS_SEMANA_LABELS: Record<DiaSemana, string> = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
}

export const STATUS_DISPONIBILIDADE_LABELS: Record<
  StatusDisponibilidade,
  string
> = {
  DISPONIVEL: "Disponível",
  INDISPONIVEL: "Indisponível",
}

/**
 * Helpers para ordenação
 */
export const DIAS_SEMANA_ORDER: Record<DiaSemana, number> = {
  SEGUNDA: 1,
  TERCA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SABADO: 6,
}
