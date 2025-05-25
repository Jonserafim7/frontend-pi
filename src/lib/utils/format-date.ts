import { format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Formata uma data para exibição no formato 'dd/MM/yyyy'.
 * Se a data for inválida ou nula, retorna um traço '-'.
 *
 * @param date A data a ser formatada (string, número ou objeto Date).
 * @returns A data formatada ou '-'.
 */
export const formatDateToDisplay = (
  date: string | number | Date | undefined | null,
): string => {
  if (date === null || date === undefined) {
    return "-"
  }

  const dateObj = new Date(date)

  if (!isValid(dateObj)) {
    return "-"
  }

  try {
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return "-" // Retorna um placeholder em caso de erro inesperado na formatação
  }
}
