import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/**
 * Exemplo de uso do componente Toast atualizado
 * Demonstra diferentes variantes e opções do toast
 */
export function ToastExample() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Exemplos de Toast</h2>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => toast("Notificação Padrão")}>Toast Padrão</Button>

        <Button
          variant="default"
          onClick={() => toast("Operação Concluída")}
        >
          Toast Sucesso
        </Button>

        <Button
          variant="destructive"
          onClick={() => toast("Erro Encontrado")}
        >
          Toast Erro
        </Button>

        <Button
          variant="default"
          onClick={() => toast("Atenção")}
        >
          Toast Aviso
        </Button>

        <Button
          variant="secondary"
          onClick={() => toast("Informação")}
        >
          Toast Info
        </Button>

        <Button
          variant="outline"
          onClick={() => toast("Com Ação")}
        >
          Toast Com Ação
        </Button>

        <Button
          variant="outline"
          onClick={() => toast("Duração Personalizada")}
        >
          Toast Longo (10s)
        </Button>
      </div>
    </div>
  )
}
