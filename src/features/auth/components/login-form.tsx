import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "../contexts/auth-context"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Mail } from "lucide-react"
import { authControllerSignInBody } from "@/api-generated/zod-schemas/auth/auth"

/**
 * Type definition for the login form values
 */
type LoginFormValues = z.infer<typeof authControllerSignInBody>

const DEFAULT_FORM_VALUES: Partial<LoginFormValues> = {
  email: "",
  senha: "",
}

/**
 * Login form component with validation and error handling
 */
export function LoginForm(): React.ReactElement {
  const { login, error: authError, isLoading } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(authControllerSignInBody),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  })

  /**
   * Handle form submission
   */
  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      setSubmitError(null)
      await login(values.email, values.senha)
    } catch (error) {
      setSubmitError(
        "Ocorreu um erro ao fazer login. Por favor, tente novamente.",
      )
      console.error("Login submission error:", error)
    }
  }

  // Combined error from auth context or local state
  const errorMessage = authError || submitError

  return (
    <div className="w-full space-y-6">
      {errorMessage && (
        <Alert
          variant="destructive"
          className="mb-4"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        className="pl-10"
                        placeholder="seu@email.com"
                        {...field}
                        disabled={isLoading}
                        type="email"
                        autoComplete="email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Senha</FormLabel>
                  </div>
                  <PasswordInput
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    {...field}
                  />
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="link"
            className="text-muted-foreground hover:text-primary h-auto p-0 text-xs"
            disabled={isLoading}
          >
            Esqueceu sua senha?
          </Button>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ?
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            : "Entrar"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
