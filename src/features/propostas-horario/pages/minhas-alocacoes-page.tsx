import { useState } from "react"
import { AlertCircle, Filter, RotateCcw, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useMinhasAlocacoes,
  useAlocacoesStats,
} from "../hooks/use-minhas-alocacoes"
import { AlocacaoCard } from "../components/alocacao-card"
import { AlocacoesStatsComponent } from "../components/alocacoes-stats"
import type { AlocacaoHorarioResponseDto } from "@/api-generated/model"

/**
 * Mapeamento dos dias da semana para filtragem
 */
const diasSemanaOptions = [
  { value: "SEGUNDA", label: "Segunda-feira" },
  { value: "TERCA", label: "Terça-feira" },
  { value: "QUARTA", label: "Quarta-feira" },
  { value: "QUINTA", label: "Quinta-feira" },
  { value: "SEXTA", label: "Sexta-feira" },
  { value: "SABADO", label: "Sábado" },
  { value: "DOMINGO", label: "Domingo" },
] as const

/**
 * Página para professor visualizar suas alocações de horário
 */
export function MinhasAlocacoesPage() {
  const { data: alocacoes = [], isLoading, error, refetch } = useMinhasAlocacoes()

  // Estados para filtros
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroDia, setFiltroDia] = useState<string>("todos")

  // Calcular estatísticas
  const stats = useAlocacoesStats(alocacoes)

  // Filtrar alocações baseado nos critérios
  const alocacoesFiltradas = alocacoes.filter((alocacao) => {
    const disciplinaNome =
      alocacao.turma.disciplinaOfertada.disciplina.nome.toLowerCase()
    const turmaCode = alocacao.turma.codigoDaTurma.toLowerCase()
    const textoFiltro = filtroTexto.toLowerCase()

    const passaFiltroTexto =
      disciplinaNome.includes(textoFiltro) || turmaCode.includes(textoFiltro)

    const passaFiltroDia =
      filtroDia === "todos" || alocacao.diaDaSemana === filtroDia

    return passaFiltroTexto && passaFiltroDia
  })

  // Agrupar alocações por dia da semana para melhor organização
  const alocacoesPorDia = alocacoesFiltradas.reduce(
    (acc, alocacao) => {
      const dia = alocacao.diaDaSemana
      if (!acc[dia]) {
        acc[dia] = []
      }
      acc[dia].push(alocacao)
      return acc
    },
    {} as Record<string, AlocacaoHorarioResponseDto[]>,
  )

  // Ordenar alocações dentro de cada dia por horário
  Object.keys(alocacoesPorDia).forEach((dia) => {
    alocacoesPorDia[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  })

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroTexto("")
    setFiltroDia("todos")
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar suas alocações. Tente novamente.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => refetch()}
          className="mt-4"
          variant="outline"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minhas Alocações</h1>
        <p className="text-muted-foreground">
          Visualize todas as suas aulas e horários alocados
        </p>
      </div>

      {/* Estatísticas */}
      <AlocacoesStatsComponent
        stats={stats}
        isLoading={isLoading}
      />

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Buscar por disciplina ou turma..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filtroDia}
          onValueChange={setFiltroDia}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por dia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os dias</SelectItem>
            {diasSemanaOptions.map((dia) => (
              <SelectItem
                key={dia.value}
                value={dia.value}
              >
                {dia.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filtroTexto || filtroDia !== "todos") && (
          <Button
            variant="outline"
            onClick={limparFiltros}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Loading estado */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted h-48 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}

      {/* Conteúdo principal */}
      {!isLoading && (
        <>
          {alocacoesFiltradas.length === 0 ?
            <div className="py-12 text-center">
              <div className="text-muted-foreground mb-2 text-lg">
                {alocacoes.length === 0 ?
                  "Você ainda não possui aulas alocadas"
                : "Nenhuma alocação encontrada com os filtros aplicados"}
              </div>
              {filtroTexto || filtroDia !== "todos" ?
                <Button
                  variant="outline"
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </Button>
              : null}
            </div>
          : <div className="space-y-8">
              {/* Grid de alocações */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {alocacoesFiltradas.map((alocacao) => (
                  <AlocacaoCard
                    key={alocacao.id}
                    alocacao={alocacao}
                  />
                ))}
              </div>

              {/* Resumo dos resultados */}
              <div className="text-muted-foreground text-center text-sm">
                Exibindo {alocacoesFiltradas.length} de {alocacoes.length}{" "}
                alocações
              </div>
            </div>
          }
        </>
      )}
    </div>
  )
}
