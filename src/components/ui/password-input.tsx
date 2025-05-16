"use client"

import { Input } from "./input"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  containerClassName?: string
  icon?: ReactNode
}

export function PasswordInput({
  className,
  id: idProp,
  containerClassName,
  icon = <Lock className="text-muted-foreground h-4 w-4" />,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const id = idProp || `password-input-${Math.random().toString(36).substr(2, 9)}`

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  return (
    <div className={cn("w-full space-y-2", containerClassName)}>
      <div className="relative">
        {icon && (
          <div className="absolute top-1/2 left-3 -translate-y-1/2">{icon}</div>
        )}
        <Input
          id={id}
          className={cn(icon ? "pl-10" : "", "pr-9", className)}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center rounded-e-md outline-offset-2 transition-colors focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          aria-controls={id}
        >
          {isVisible ?
            <EyeOff
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          : <Eye
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          }
        </button>
      </div>
    </div>
  )
}
