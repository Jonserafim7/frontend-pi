import { useDisponibilidadeProfessorControllerGetSlotsValidos } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
import { getDisponibilidadeProfessorControllerGetSlotsValidosQueryKey } from "@/api-generated/client/disponibilidade-de-professores/disponibilidade-de-professores"
/**
 * Hook para buscar slots válidos de um período
 */
export const useSlotsValidos = (periodoId?: string) => {
  return useDisponibilidadeProfessorControllerGetSlotsValidos(periodoId!, {
    query: {
      enabled: !!periodoId,
      queryKey: getDisponibilidadeProfessorControllerGetSlotsValidosQueryKey(
        periodoId!,
      ),
    },
  })
}

/**
 * Tipo para resposta de slots válidos
 */
export type SlotsValidosResponse = {
  [diaSemana: string]: Array<{
    horaInicio: string
    horaFim: string
    duracao: number
  }>
}
