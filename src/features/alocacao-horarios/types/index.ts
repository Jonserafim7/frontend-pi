import type {
  AlocacaoHorarioResponseDto,
  AlocacaoHorarioResponseDtoDiaDaSemana,
  TurmaBasicaDto,
} from "@/api-generated/model"

// Mapeamento dos dias da semana da API para componentes
export const DIA_SEMANA_MAP = {
  SEGUNDA: "SEG",
  TERCA: "TER",
  QUARTA: "QUA",
  QUINTA: "QUI",
  SEXTA: "SEX",
  SABADO: "SAB",
} as const

export const DIA_SEMANA_REVERSE_MAP = {
  SEG: "SEGUNDA",
  TER: "TERCA",
  QUA: "QUARTA",
  QUI: "QUINTA",
  SEX: "SEXTA",
  SAB: "SABADO",
} as const

// Interface para turma compatível com componentes existentes
export interface TurmaDisplay {
  id: string
  codigo: string
  disciplina: string
  professor: string
  professorId?: string
  aulasAlocadas: number
  cargaHorariaSemanal: number
  status: "completa" | "parcial" | "nao-alocada" | "sem-professor"
}

// Interface para alocação compatível com componentes existentes
export interface AlocacaoDisplay {
  id: string
  turmaId: string
  turma: TurmaDisplay
  diaDaSemana: string // SEG, TER, etc.
  horaInicio: string
  horaFim: string
  turno: string
}

// Função para mapear turma da API para display
export function mapTurmaToDisplay(
  turma: TurmaBasicaDto,
  aulasAlocadas: number = 0,
): TurmaDisplay {
  // Como os tipos da API são { [key: string]: unknown }, fazemos cast seguro
  const disciplinaOfertada = turma.disciplinaOfertada as any
  const professorAlocado = turma.professorAlocado as any

  const cargaHorariaSemanal = disciplinaOfertada?.disciplina?.cargaHoraria || 0

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

  return {
    id: turma.id,
    codigo: turma.codigoDaTurma,
    disciplina: disciplinaOfertada?.disciplina?.nome || "",
    professor: professorAlocado?.nome || "Sem Professor",
    professorId: professorAlocado?.id,
    aulasAlocadas,
    cargaHorariaSemanal,
    status,
  }
}

// Função para mapear alocação da API para display
export function mapAlocacaoToDisplay(
  alocacao: AlocacaoHorarioResponseDto,
): AlocacaoDisplay {
  const diaSemanaDisplay = DIA_SEMANA_MAP[alocacao.diaDaSemana]
  const turmaDisplay = mapTurmaToDisplay(alocacao.turma)

  // Determinar turno baseado no horário
  const hora = parseInt(alocacao.horaInicio.split(":")[0])
  const turno = hora < 12 ? "manha" : "tarde"

  return {
    id: alocacao.id,
    turmaId: alocacao.idTurma,
    turma: turmaDisplay,
    diaDaSemana: diaSemanaDisplay,
    horaInicio: alocacao.horaInicio,
    horaFim: alocacao.horaFim,
    turno,
  }
}

// Função para converter dia da semana do componente para API
export function mapDiaSemanaToApi(
  dia: string,
): AlocacaoHorarioResponseDtoDiaDaSemana {
  return DIA_SEMANA_REVERSE_MAP[
    dia as keyof typeof DIA_SEMANA_REVERSE_MAP
  ] as AlocacaoHorarioResponseDtoDiaDaSemana
}
