import type {
  AlocacaoHorarioResponseDto,
  AlocacaoHorarioResponseDtoDiaDaSemana,
  ConfiguracaoHorarioDto,
} from "@/api-generated/model"

/**
 * Mapeamento dos dias da semana da API para os nomes exibidos no grid
 */
export const DAY_MAPPING: Record<AlocacaoHorarioResponseDtoDiaDaSemana, string> =
  {
    SEGUNDA: "Segunda",
    TERCA: "Terça",
    QUARTA: "Quarta",
    QUINTA: "Quinta",
    SEXTA: "Sexta",
    SABADO: "Sábado",
  }

/**
 * Mapeamento reverso dos nomes exibidos para os valores da API
 */
export const REVERSE_DAY_MAPPING: Record<
  string,
  AlocacaoHorarioResponseDtoDiaDaSemana
> = {
  Segunda: "SEGUNDA",
  Terça: "TERCA",
  Quarta: "QUARTA",
  Quinta: "QUINTA",
  Sexta: "SEXTA",
  Sábado: "SABADO",
}

/**
 * Estrutura de um slot de aula processado
 */
export interface ProcessedClassSlot {
  inicio: string
  fim: string
  turno: "manha" | "tarde" | "noite"
  index: number
}

/**
 * Posição de uma alocação no grid
 */
export interface GridPosition {
  dayIndex: number
  slotIndex: number
  day: string
  slot: ProcessedClassSlot
}

/**
 * Processa os slots de aula da configuração de horário
 */
export function processClassSlots(
  configuracaoHorario: ConfiguracaoHorarioDto,
): ProcessedClassSlot[] {
  const slots: ProcessedClassSlot[] = []
  let index = 0

  // Adicionar slots da manhã
  if (configuracaoHorario.aulasTurnoManha) {
    configuracaoHorario.aulasTurnoManha.forEach((slot) => {
      slots.push({ ...slot, turno: "manha", index: index++ })
    })
  }

  // Adicionar slots da tarde
  if (configuracaoHorario.aulasTurnoTarde) {
    configuracaoHorario.aulasTurnoTarde.forEach((slot) => {
      slots.push({ ...slot, turno: "tarde", index: index++ })
    })
  }

  // Adicionar slots da noite
  if (configuracaoHorario.aulasTurnoNoite) {
    configuracaoHorario.aulasTurnoNoite.forEach((slot) => {
      slots.push({ ...slot, turno: "noite", index: index++ })
    })
  }

  return slots
}

/**
 * Encontra a posição de uma alocação no grid
 */
export function findGridPosition(
  alocacao: AlocacaoHorarioResponseDto,
  classSlots: ProcessedClassSlot[],
  daysToShow: string[],
): GridPosition | null {
  // Encontrar o dia
  const dayName = DAY_MAPPING[alocacao.diaDaSemana]
  const dayIndex = daysToShow.indexOf(dayName)

  if (dayIndex === -1) {
    return null // Dia não encontrado
  }

  // Encontrar o slot baseado no horário
  const slotIndex = classSlots.findIndex(
    (slot) =>
      slot.inicio === alocacao.horaInicio && slot.fim === alocacao.horaFim,
  )

  if (slotIndex === -1) {
    return null // Slot não encontrado
  }

  return {
    dayIndex,
    slotIndex,
    day: dayName,
    slot: classSlots[slotIndex],
  }
}

/**
 * Agrupa alocações por posição no grid
 */
export function groupAllocationsByPosition(
  alocacoes: AlocacaoHorarioResponseDto[],
  classSlots: ProcessedClassSlot[],
  daysToShow: string[],
): Map<string, AlocacaoHorarioResponseDto[]> {
  const groupedAllocations = new Map<string, AlocacaoHorarioResponseDto[]>()

  alocacoes.forEach((alocacao) => {
    const position = findGridPosition(alocacao, classSlots, daysToShow)

    if (position) {
      const key = `${position.dayIndex}-${position.slotIndex}`
      const existing = groupedAllocations.get(key) || []
      groupedAllocations.set(key, [...existing, alocacao])
    }
  })

  return groupedAllocations
}

/**
 * Verifica se um horário está dentro de um slot
 */
export function isTimeInSlot(time: string, slot: ProcessedClassSlot): boolean {
  return time >= slot.inicio && time <= slot.fim
}

/**
 * Verifica se duas alocações se sobrepõem
 */
export function doAllocationsOverlap(
  alocacao1: AlocacaoHorarioResponseDto,
  alocacao2: AlocacaoHorarioResponseDto,
): boolean {
  // Mesmo dia
  if (alocacao1.diaDaSemana !== alocacao2.diaDaSemana) {
    return false
  }

  // Verificar sobreposição de horários
  const start1 = alocacao1.horaInicio
  const end1 = alocacao1.horaFim
  const start2 = alocacao2.horaInicio
  const end2 = alocacao2.horaFim

  return start1 < end2 && start2 < end1
}

/**
 * Encontra conflitos entre alocações
 */
export function findAllocationConflicts(
  alocacoes: AlocacaoHorarioResponseDto[],
): Array<{
  alocacao1: AlocacaoHorarioResponseDto
  alocacao2: AlocacaoHorarioResponseDto
}> {
  const conflicts: Array<{
    alocacao1: AlocacaoHorarioResponseDto
    alocacao2: AlocacaoHorarioResponseDto
  }> = []

  for (let i = 0; i < alocacoes.length; i++) {
    for (let j = i + 1; j < alocacoes.length; j++) {
      if (doAllocationsOverlap(alocacoes[i], alocacoes[j])) {
        conflicts.push({
          alocacao1: alocacoes[i],
          alocacao2: alocacoes[j],
        })
      }
    }
  }

  return conflicts
}

/**
 * Calcula estatísticas das alocações
 */
export function calculateAllocationStats(
  alocacoes: AlocacaoHorarioResponseDto[],
  classSlots: ProcessedClassSlot[],
  daysToShow: string[],
) {
  const totalSlots = classSlots.length * daysToShow.length
  const allocatedSlots = groupAllocationsByPosition(
    alocacoes,
    classSlots,
    daysToShow,
  ).size
  const conflicts = findAllocationConflicts(alocacoes)

  return {
    totalSlots,
    allocatedSlots,
    freeSlots: totalSlots - allocatedSlots,
    utilizationRate: (allocatedSlots / totalSlots) * 100,
    conflictsCount: conflicts.length,
    conflicts,
  }
}
