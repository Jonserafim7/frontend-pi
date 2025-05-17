import { z } from "zod"
import { parse, isAfter, isEqual } from "date-fns"

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
    qtdAulasPorBloco: z
      .number({
        required_error: "Quantidade de aulas por bloco é obrigatória.",
        invalid_type_error: "Quantidade de aulas por bloco deve ser um número.",
      })
      .int({
        message: "Quantidade de aulas por bloco deve ser um número inteiro.",
      })
      .positive({ message: "Quantidade de aulas por bloco deve ser positiva." })
      .min(1, { message: "Quantidade de aulas por bloco deve ser no mínimo 1." }),
    inicioTurnoManha: timeSchema,
    fimTurnoManha: timeSchema,
    inicioTurnoTarde: timeSchema,
    fimTurnoTarde: timeSchema,
    inicioTurnoNoite: timeSchema,
    fimTurnoNoite: timeSchema,
  })
  .superRefine((data, ctx) => {
    const referenceDate = new Date() // Usada para parsear HH:mm para objetos Date

    // Validações de consistência para o turno da MANHÃ
    const inicioManha = parse(data.inicioTurnoManha, "HH:mm", referenceDate)
    const fimManha = parse(data.fimTurnoManha, "HH:mm", referenceDate)
    if (isAfter(inicioManha, fimManha) || isEqual(inicioManha, fimManha)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O horário de término do turno da manhã deve ser após o horário de início.",
        path: ["fimTurnoManha"], // Associa o erro ao campo fimTurnoManha
      })
    }

    // Validações de consistência para o turno da TARDE
    const inicioTarde = parse(data.inicioTurnoTarde, "HH:mm", referenceDate)
    const fimTarde = parse(data.fimTurnoTarde, "HH:mm", referenceDate)
    if (isAfter(inicioTarde, fimTarde) || isEqual(inicioTarde, fimTarde)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O horário de término do turno da tarde deve ser após o horário de início.",
        path: ["fimTurnoTarde"],
      })
    }

    // Validação entre MANHÃ e TARDE
    if (isAfter(fimManha, inicioTarde)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O início do turno da tarde não pode ser antes do término do turno da manhã.",
        path: ["inicioTurnoTarde"],
      })
    }

    // Validações de consistência para o turno da NOITE
    const inicioNoite = parse(data.inicioTurnoNoite, "HH:mm", referenceDate)
    const fimNoite = parse(data.fimTurnoNoite, "HH:mm", referenceDate)
    if (isAfter(inicioNoite, fimNoite) || isEqual(inicioNoite, fimNoite)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O horário de término do turno da noite deve ser após o horário de início.",
        path: ["fimTurnoNoite"],
      })
    }

    // Validação entre TARDE e NOITE
    if (isAfter(fimTarde, inicioNoite)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "O início do turno da noite não pode ser antes do término do turno da tarde.",
        path: ["inicioTurnoNoite"],
      })
    }
  })

export type ConfiguracaoHorarioSchema = z.infer<typeof configuracaoHorarioSchema>
