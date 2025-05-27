import { Sun, Moon, Clock, Sunset } from "lucide-react"
import type { TurnoType } from "../hooks/use-configuracoes-horario"

/**
 * Utilitários para estilos visuais dos turnos
 * Centraliza a lógica de ícones, cores e badges
 */

export const getTurnoIcon = (turno: TurnoType) => {
  switch (turno) {
    case "manha":
      return Sun
    case "tarde":
      return Sunset
    case "noite":
      return Moon
    default:
      return Clock
  }
}

export const getTurnoColor = (turno: TurnoType) => {
  switch (turno) {
    case "manha":
      return "text-amber-500"
    case "tarde":
      return "text-orange-500"
    case "noite":
      return "text-indigo-500"
    default:
      return "text-gray-500"
  }
}

export const getTurnoBadgeColor = (turno: TurnoType) => {
  switch (turno) {
    case "manha":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    case "tarde":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "noite":
      return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

export const getTurnoBackgroundColor = (turno: TurnoType) => {
  switch (turno) {
    case "manha":
      return "bg-amber-50 border-amber-200"
    case "tarde":
      return "bg-orange-50 border-orange-200"
    case "noite":
      return "bg-indigo-50 border-indigo-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}
