import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useLocation } from "react-router"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Hook personalizado para verificar se a rota atual corresponde ao caminho fornecido
 * @param path - O caminho a ser verificado
 * @returns Um booleano indicando se a rota está ativa
 */
export function useIsRouteActive(path: string): boolean {
  const location = useLocation()

  // Verifica se o caminho atual começa com o caminho fornecido
  // Isso permite que subrotas também sejam consideradas ativas
  return (
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(`${path}/`))
  )
}
