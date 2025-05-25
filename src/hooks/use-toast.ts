import { toast, type ToastT } from "sonner"

type ToastType = ReturnType<typeof toast>

/**
 * Opções disponíveis para personalização do toast
 */
type ToastOptions = {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  onAutoClose?: (toast: ToastT) => void
  id?: string
}

/**
 * Hook personalizado para exibir notificações toast utilizando o componente Sonner
 * Posicionado no canto inferior direito da tela
 * @returns Funções para exibir diferentes tipos de toast
 */
export function useToast() {
  /**
   * Exibe uma notificação toast
   * @param options Opções do toast
   */
  const showToast = (options: ToastOptions): ToastType => {
    const {
      title,
      description,
      variant = "default",
      duration,
      action,
      onDismiss,
      onAutoClose,
      id,
    } = options

    const toastOptions = {
      description,
      duration,
      action,
      onDismiss,
      onAutoClose,
      id,
    }

    // Mapeia as variantes para os tipos do sonner
    switch (variant) {
      case "destructive":
        return toast.error(title, toastOptions)
      case "success":
        return toast.success(title, toastOptions)
      case "warning":
        return toast.warning(title, toastOptions)
      case "info":
        return toast.info(title, toastOptions)
      default:
        return toast(title, toastOptions)
    }
  }

  return {
    dismiss: toast.dismiss,
    // API compatível com o formato do shadcn/ui toast
    toast: showToast,
  }
}
