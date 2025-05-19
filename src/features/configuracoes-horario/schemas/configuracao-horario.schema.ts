import { z } from "zod"
import { parse, isAfter, isEqual, addMinutes } from "date-fns"

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: "Horário deve estar no formato HH:mm",
})

export const configuracaoHorarioSchema = z
  .object({
    duracaoAulaMinutos: z
      .number({
        required_error: "Duração da aula é obrigatória.",
        invalid_type_error: "Duração da aula deve ser um número.",
      })
      .int({ message: "Duração da aula deve ser um número inteiro." })
      .positive({ message: "Duração da aula deve ser positiva." })
      .min(1, { message: "Duração da aula deve ser de no mínimo 1 minuto." }),
    numeroAulasPorTurno: z
      .number({
        required_error: "Número de aulas por turno é obrigatório.",
        invalid_type_error: "Número de aulas por turno deve ser um número.",
      })
      .int({
        message: "Número de aulas por turno deve ser um número inteiro.",
      })
      .positive({ message: "Número de aulas por turno deve ser positivo." })
      .min(1, { message: "Número de aulas por turno deve ser no mínimo 1." }),
    inicioTurnoManha: timeSchema,
    inicioTurnoTarde: timeSchema,
    inicioTurnoNoite: timeSchema,
  })
  .superRefine((data, ctx) => {
    const referenceDate = new Date() // Usada para parsear HH:mm para objetos Date

    // Parse dos horários de início
    const inicioManha = parse(data.inicioTurnoManha, "HH:mm", referenceDate)
    const inicioTarde = parse(data.inicioTurnoTarde, "HH:mm", referenceDate)
    const inicioNoite = parse(data.inicioTurnoNoite, "HH:mm", referenceDate)

    // Validação da ordem dos horários de início dos turnos
    if (isAfter(inicioManha, inicioTarde) || isEqual(inicioManha, inicioTarde)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O horário de início do turno da tarde deve ser após o horário de início do turno da manhã.",
        path: ["inicioTurnoTarde"],
      })
    }
    if (isAfter(inicioTarde, inicioNoite) || isEqual(inicioTarde, inicioNoite)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O horário de início do turno da noite deve ser após o horário de início do turno da tarde.",
        path: ["inicioTurnoNoite"],
      })
    }

    // Cálculo dos horários de fim dos turnos
    const duracaoTotalAulasMinutos =
      data.numeroAulasPorTurno * data.duracaoAulaMinutos

    const fimManhaCalculado = addMinutes(inicioManha, duracaoTotalAulasMinutos)
    const fimTardeCalculado = addMinutes(inicioTarde, duracaoTotalAulasMinutos)

    // Validação de sobreposição entre turnos (usando horários de fim calculados)
    // Manhã -> Tarde
    if (isAfter(fimManhaCalculado, inicioTarde)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O término calculado do turno da manhã (baseado na duração e número de aulas) não pode ser após o início do turno da tarde.",
        path: ["inicioTurnoTarde"],
      })
    }

    // Tarde -> Noite
    if (isAfter(fimTardeCalculado, inicioNoite)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O término calculado do turno da tarde (baseado na duração e número de aulas) não pode ser após o início do turno da noite.",
        path: ["inicioTurnoNoite"],
      })
    }
  })

export type ConfiguracaoHorarioSchema = z.infer<typeof configuracaoHorarioSchema>
