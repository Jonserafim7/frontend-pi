import type {
  AlocacaoHorarioResponseDto,
  AlocacaoHorarioResponseDtoDiaDaSemana,
  TurmaBasicaDto,
  ConfiguracaoHorarioDto,
} from "@/api-generated/model"
import {
  DIA_SEMANA_MAP,
  DIA_SEMANA_REVERSE_MAP,
} from "@/lib/constants/dias-da-semana.constant"

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

// Função utilitária para determinar turno baseado nas configurações
export function determinarTurnoPorHorario(
  horario: string,
  configuracao?: ConfiguracaoHorarioDto | null,
): "manha" | "tarde" | "noite" {
  if (!configuracao) {
    // Fallback para lógica simples se não há configuração
    const hora = parseInt(horario.split(":")[0])
    if (hora < 12) return "manha"
    if (hora < 18) return "tarde"
    return "noite"
  }

  // Converter horário para minutos para comparação
  const [horas, minutos] = horario.split(":").map(Number)
  const horarioMinutos = horas * 60 + minutos

  // Converter horários de início dos turnos para minutos
  const inicioManhaMinutos = configuracao.inicioTurnoManha
    .split(":")
    .map(Number)
    .reduce((h, m) => h * 60 + m)

  const inicioTardeMinutos = configuracao.inicioTurnoTarde
    .split(":")
    .map(Number)
    .reduce((h, m) => h * 60 + m)

  const inicioNoiteMinutos = configuracao.inicioTurnoNoite
    .split(":")
    .map(Number)
    .reduce((h, m) => h * 60 + m)

  // Determinar turno baseado nos horários configurados
  if (horarioMinutos >= inicioNoiteMinutos) {
    return "noite"
  } else if (horarioMinutos >= inicioTardeMinutos) {
    return "tarde"
  } else {
    return "manha"
  }
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
  configuracao?: ConfiguracaoHorarioDto | null,
): AlocacaoDisplay {
  const diaSemanaDisplay = DIA_SEMANA_MAP[alocacao.diaDaSemana]
  const turmaDisplay = mapTurmaToDisplay(alocacao.turma)

  // Determinar turno baseado nas configurações dinâmicas
  const turno = determinarTurnoPorHorario(alocacao.horaInicio, configuracao)

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
