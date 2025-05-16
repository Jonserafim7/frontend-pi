import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

/**
 * Exemplo de uso do componente Toast atualizado
 * Demonstra diferentes variantes e opções do toast
 */
export function ToastExample() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Exemplos de Toast</h2>
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() =>
            toast({
              title: "Notificação Padrão",
              description: "Esta é uma notificação padrão do sistema",
            })
          }
        >
          Toast Padrão
        </Button>

        <Button
          variant="default"
          onClick={() =>
            toast({
              title: "Operação Concluída",
              description: "A operação foi concluída com sucesso",
              variant: "success",
            })
          }
        >
          Toast Sucesso
        </Button>

        <Button
          variant="destructive"
          onClick={() =>
            toast({
              title: "Erro Encontrado",
              description: "Ocorreu um erro ao processar sua solicitação",
              variant: "destructive",
            })
          }
        >
          Toast Erro
        </Button>

        <Button
          variant="default"
          onClick={() =>
            toast({
              title: "Atenção",
              description: "Esta ação requer sua atenção",
              variant: "warning",
            })
          }
        >
          Toast Aviso
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            toast({
              title: "Informação",
              description: "Aqui está uma informação importante",
              variant: "info",
            })
          }
        >
          Toast Info
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Com Ação",
              description: "Este toast possui uma ação que pode ser executada",
              variant: "info",
              action: {
                label: "Desfazer",
                onClick: () => console.log("Ação desfeita!"),
              },
            })
          }
        >
          Toast Com Ação
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Duração Personalizada",
              description: "Este toast permanecerá visível por 10 segundos",
              duration: 10000, // 10 segundos
            })
          }
        >
          Toast Longo (10s)
        </Button>
      </div>
    </div>
  )
}
