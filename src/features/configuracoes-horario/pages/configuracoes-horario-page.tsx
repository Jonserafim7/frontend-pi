import { ConfiguracaoHorarioForm } from "../components/configuracao-horario-form"
import {
  useConfiguracoesHorarioControllerGet,
  useConfiguracoesHorarioControllerUpsert,
} from "@/api-generated/client/configurações-de-horário/configurações-de-horário"
import type { UpsertConfiguracaoHorarioDto } from "@/api-generated/model"
import { toast } from "sonner"
import { CalendarCog, Loader2 } from "lucide-react"

interface ApiError {
  message?: string
  response?: {
    data?: {
      message?: string
      error?: string
      statusCode?: number
    }
  }
}

/**
 * Página para gerenciar as configurações globais de horário.
 * Apenas acessível por usuários com o papel de DIRETOR.
 */
export function ConfiguracoesHorarioPage() {
  const {
    data: configuracaoAtual,
    isLoading: isLoadingGet,
    error: errorGet,
  } = useConfiguracoesHorarioControllerGet({})

  const {
    mutateAsync: upsertConfiguracao,
    isPending: isSubmitting,
    error: errorUpsert,
  } = useConfiguracoesHorarioControllerUpsert()

  const handleSubmit = async (data: UpsertConfiguracaoHorarioDto) => {
    try {
      await upsertConfiguracao({ data })
      toast.success("Sucesso!", {
        description: "Configurações de horário salvas com sucesso.",
      })
    } catch {
      const upsertError = errorUpsert as ApiError | null
      const errorMessage =
        upsertError?.response?.data?.message ||
        upsertError?.message ||
        "Não foi possível salvar as configurações. Tente novamente."
      toast.error("Erro ao Salvar", {
        description: errorMessage,
      })
    }
  }

  if (isLoadingGet) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="ml-2 text-lg">Carregando configurações...</p>
      </div>
    )
  }

  if (errorGet) {
    const getError = errorGet as ApiError | null
    const errorMessage =
      getError?.response?.data?.message ||
      getError?.message ||
      "Tente recarregar a página."
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-red-600">
        <p className="text-xl font-semibold">Erro ao carregar configurações</p>
        <p>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <CalendarCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Configurações Globais de Horário
            </h1>
            <p className="text-muted-foreground">
              Defina os parâmetros para a geração de horários em toda a
              instituição.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <ConfiguracaoHorarioForm
          valoresIniciais={configuracaoAtual || null}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
