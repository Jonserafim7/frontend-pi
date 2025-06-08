import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderIconContainer } from "@/components/icon-container"
import {
  BookOpenCheck,
  ChevronLeft,
  GraduationCap,
  FileText,
  Clock,
} from "lucide-react"
import { useMatrizesCurricularesControllerFindMatrizesDoCoordenador } from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import type { MatrizCurricularResponseDto } from "@/api-generated/model/matriz-curricular-response-dto"

/**
 * Página de detalhes da Matriz Curricular
 *
 * Exibe informações detalhadas sobre uma matriz curricular específica
 * incluindo o curso associado e todas as disciplinas
 */
export function MatrizCurricularDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [matrizCurricular, setMatrizCurricular] =
    useState<MatrizCurricularResponseDto | null>(null)

  const { data: matrizesCurriculares, isPending: isLoadingMatrizes } =
    useMatrizesCurricularesControllerFindMatrizesDoCoordenador()

  // Carrega os dados da matriz curricular
  useEffect(() => {
    if (matrizesCurriculares && id) {
      const matriz = matrizesCurriculares.find((m) => m.id === id)
      if (matriz) {
        setMatrizCurricular(matriz)
      }
    }
  }, [matrizesCurriculares, id])

  // Verifica se está carregando
  const isLoading = isLoadingMatrizes

  // Verifica se a matriz curricular não foi encontrada
  const matrizNotFound = !isLoading && !matrizCurricular

  if (matrizNotFound) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-10">
        <BookOpenCheck className="text-muted-foreground mb-4 h-12 w-12" />
        <h2 className="mb-2 text-2xl font-bold">
          Matriz Curricular não encontrada
        </h2>
        <p className="text-muted-foreground mb-6">
          A matriz curricular que você está procurando não existe ou foi removida.
        </p>
        <Button onClick={() => navigate("/coordenador/matrizes-curriculares")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para a lista
        </Button>
      </div>
    )
  }

  // Calcula a carga horária total
  const cargaHorariaTotal =
    matrizCurricular?.disciplinas.reduce(
      (total, disciplina) => total + disciplina.cargaHoraria,
      0,
    ) || 0

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/coordenador/matrizes-curriculares")}
          className="flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Matrizes Curriculares
        </Button>
      </div>

      {isLoading ?
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      : <>
          <div className="mb-8 flex items-center gap-4">
            <HeaderIconContainer Icon={BookOpenCheck} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {matrizCurricular?.nome}
              </h1>
              <p className="text-muted-foreground mt-1">
                Detalhes completos da matriz curricular e suas disciplinas
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Resumo Geral */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="border-l-primary/50 border-l-4">
              <CardHeader className="flex flex-row items-center gap-2">
                <GraduationCap className="text-primary mr-1 h-5 w-5" />
                <CardTitle className="text-lg">Curso</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-medium">{matrizCurricular?.nomeCurso}</p>
                <p className="text-muted-foreground text-sm">
                  Curso associado à matriz
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-primary/50 border-l-4">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="text-primary mr-1 h-5 w-5" />
                <CardTitle className="text-lg">Disciplinas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-medium">
                  {matrizCurricular?.disciplinas?.length || 0}
                </p>
                <p className="text-muted-foreground text-sm">
                  Total de disciplinas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-primary/50 border-l-4">
              <CardHeader className="flex flex-row items-center gap-2">
                <Clock className="text-primary mr-1 h-5 w-5" />
                <CardTitle className="text-lg">Carga Horária</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-medium">{cargaHorariaTotal}h</p>
                <p className="text-muted-foreground text-sm">Total da matriz</p>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Curso */}
          <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
            <CardHeader className="from-primary/10 bg-gradient-to-r to-transparent pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 flex items-center justify-center rounded-full p-2">
                  <GraduationCap className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Informações do Curso</CardTitle>
                  <CardDescription>
                    Curso ao qual esta matriz curricular está associada
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">
                  Nome do Curso
                </h3>
                <p className="text-lg font-medium">
                  {matrizCurricular?.nomeCurso}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Disciplinas */}
          <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
            <CardHeader className="from-primary/10 bg-gradient-to-r to-transparent pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 flex items-center justify-center rounded-full p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Disciplinas da Matriz</CardTitle>
                  <CardDescription>
                    Lista completa das disciplinas que compõem esta matriz
                    curricular
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(
                matrizCurricular?.disciplinas &&
                matrizCurricular.disciplinas.length > 0
              ) ?
                <div className="space-y-4">
                  {matrizCurricular.disciplinas.map((disciplina) => (
                    <Card
                      key={disciplina.id}
                      className="border-l-primary/30 border-l-4 transition-all duration-200 hover:shadow-sm"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold">
                              {disciplina.nome}
                            </h4>
                            {disciplina.codigo && (
                              <p className="text-muted-foreground text-sm">
                                Código: {disciplina.codigo}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {disciplina.cargaHoraria}h
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Carga horária
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              : <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                  <FileText className="mb-4 h-12 w-12" />
                  <p className="text-lg font-medium">
                    Nenhuma disciplina encontrada
                  </p>
                  <p className="text-sm">
                    Esta matriz curricular ainda não possui disciplinas
                    associadas.
                  </p>
                </div>
              }
            </CardContent>
          </Card>
        </>
      }
    </div>
  )
}
