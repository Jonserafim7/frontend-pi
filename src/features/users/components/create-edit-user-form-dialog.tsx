import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/features/auth/contexts/auth-context"
import { UsuarioResponseDtoPapel } from "@/api-generated/model/usuario-response-dto-papel"
import {
  useUsuariosControllerCreate,
  useUsuariosControllerUpdate,
  getUsuariosControllerFindAllQueryKey,
} from "@/api-generated/client/usuarios/usuarios"
import {
  usuariosControllerCreateBody,
  usuariosControllerUpdateBody,
} from "@/api-generated/zod-schemas/usuarios/usuarios"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog"
import { HeaderIconContainer } from "@/components/icon-container"
import { Loader2, UserPen, UserPlus } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import { useQueryClient } from "@tanstack/react-query"
import type { UsuarioResponseDto } from "@/api-generated/model/usuario-response-dto"
import type { AxiosError } from "axios"
import { toast } from "sonner"

// Tipos inferidos dos schemas
type CreateUserFormValues = z.infer<typeof usuariosControllerCreateBody>
type UpdateUserFormValues = z.infer<typeof usuariosControllerUpdateBody>

// Tipo união para o formulário
type UserFormValues = CreateUserFormValues | UpdateUserFormValues

// Schemas de validação
const createUserSchema = usuariosControllerCreateBody
const updateUserSchema = usuariosControllerUpdateBody

interface CreateEditUserFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user?: UsuarioResponseDto
}

/**
 * Página de formulário de usuário (criação e edição)
 */
export function CreateEditUserFormDialog({
  isOpen,
  onOpenChange,
  user,
}: CreateEditUserFormDialogProps) {
  // Hooks
  const navigate = useNavigate()
  const { isAdmin, isDiretor, isCoordenador } = useAuth()

  // Centraliza definição dos papéis e permissões de exibição
  const papelOptions = [
    {
      value: UsuarioResponseDtoPapel.ADMIN,
      label: "Administrador",
      canShow: () => isAdmin(),
    },
    {
      value: UsuarioResponseDtoPapel.DIRETOR,
      label: "Diretor",
      canShow: () => isAdmin(),
    },
    {
      value: UsuarioResponseDtoPapel.COORDENADOR,
      label: "Coordenador",
      canShow: () => isAdmin() || isDiretor(),
    },
    {
      value: UsuarioResponseDtoPapel.PROFESSOR,
      label: "Professor",
      canShow: () => isAdmin() || isDiretor() || isCoordenador(),
    },
  ]

  const { mutateAsync: mutateUpdate } = useUsuariosControllerUpdate()
  const { mutateAsync: mutateCreate } = useUsuariosControllerCreate()
  const queryClient = useQueryClient()

  // Estados
  const [isEditMode] = useState(!!user)

  // Configuração do formulário
  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      nome: "",
      email: "",
      ...(isEditMode ? {} : { senha: "" }), // Apenas inclui senha no modo de criação
      papel: UsuarioResponseDtoPapel.PROFESSOR,
    },
  })

  // Carrega os dados do usuário para edição
  useEffect(() => {
    if (isEditMode && user) {
      // Atualiza o formulário com os dados do usuário existente
      form.reset({
        nome: user.nome || "",
        email: user.email || "",
        // Não definimos a senha para manter a existente
        papel: user.papel || UsuarioResponseDtoPapel.PROFESSOR,
      } as UserFormValues)
    } else if (!isEditMode) {
      // Reseta para os valores padrão no modo de criação
      form.reset({
        nome: "",
        email: "",
        senha: "",
        papel: UsuarioResponseDtoPapel.PROFESSOR,
      } as UserFormValues)
    }

    // Limpa erros de validação
    form.clearErrors()
  }, [isEditMode, user, form])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: UserFormValues) => {
    if (isEditMode && user) {
      // Na edição, a senha é opcional
      const updateData = data as UpdateUserFormValues

      // Criar payload apenas com os campos que foram alterados
      const updatePayload: Partial<UpdateUserFormValues> = {}

      // Adicionar apenas os campos que foram fornecidos
      if (updateData.nome) updatePayload.nome = updateData.nome
      if (updateData.email) updatePayload.email = updateData.email
      if (updateData.papel) updatePayload.papel = updateData.papel

      // Se a senha foi fornecida e não está vazia, adicionar ao payload
      if (updateData.senha && updateData.senha.trim() !== "") {
        updatePayload.senha = updateData.senha
      }

      mutateUpdate(
        {
          id: user.id,
          data: updatePayload,
        },
        {
          onSuccess: () => {
            toast.success("Usuário atualizado")
            form.reset()
            onOpenChange(false)
            queryClient.invalidateQueries({
              queryKey: getUsuariosControllerFindAllQueryKey(),
            })
          },
          onError: (error: AxiosError) => {
            const errorMessage =
              error?.request.response || "Ocorreu um erro ao atualizar o usuário"
            toast.error(errorMessage)
          },
        },
      )
    } else {
      // Na criação, usamos o schema de criação que já valida a senha
      const createData = data as CreateUserFormValues

      mutateCreate(
        { data: createData },
        {
          onSuccess: () => {
            navigate("/usuarios")
            toast.success("Usuário criado")
            form.reset()
            onOpenChange(false)
            queryClient.invalidateQueries({
              queryKey: getUsuariosControllerFindAllQueryKey(),
            })
          },
          onError: (error: AxiosError) => {
            const errorMessage =
              error?.request.response || "Ocorreu um erro ao criar o usuário"
            toast.error(errorMessage)
          },
        },
      )
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-8">
        <DialogHeader className="flex-row items-center gap-3">
          <HeaderIconContainer Icon={isEditMode ? UserPen : UserPlus} />
          <div>
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ?
                "Edite as informações do usuário abaixo."
              : "Preencha as informações do usuário abaixo."}
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Campo de nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de senha */}
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Senha {isEditMode && "(deixe em branco para manter a atual)"}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={isEditMode ? "••••••" : "Senha"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de papel */}
            <FormField
              control={form.control}
              name="papel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {papelOptions
                        .filter((option) => option.canShow())
                        .map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões de ação */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting || !isAdmin}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ?
                  <>
                    <Loader2 className="animate-spin" />
                    Processando...
                  </>
                : isEditMode ?
                  "Atualizar"
                : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
