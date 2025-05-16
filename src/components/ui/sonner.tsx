import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"

/**
 * Componente Toaster personalizado que utiliza o Sonner
 * Configurado para se adequar ao tema da aplicação
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors
      expand
      style={
        {
          // Cores personalizadas para o toast
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(var(--success))",
          "--success-text": "hsl(var(--success-foreground))",
          "--success-border": "hsl(var(--success))",
          "--error-bg": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--error-border": "hsl(var(--destructive))",
          "--warning-bg": "hsl(var(--warning))",
          "--warning-text": "hsl(var(--warning-foreground))",
          "--warning-border": "hsl(var(--warning))",
          "--info-bg": "hsl(var(--info))",
          "--info-text": "hsl(var(--info-foreground))",
          "--info-border": "hsl(var(--info))",
          // Arredondamento e sombra
          "--border-radius": "var(--radius)",
          "--shadow": "var(--shadow)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
