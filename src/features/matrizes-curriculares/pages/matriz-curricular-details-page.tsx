import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ChevronLeft,
  BookOpenCheck,
  GraduationCap,
  BookOpen,
  Clock,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMatrizesCurricularesControllerFindAll } from "@/api-generated/client/matrizes-curriculares/matrizes-curriculares"
import { useCursosControllerFindAll } from "@/api-generated/client/cursos/cursos"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { HeaderIconContainer } from "@/components/icon-container"
// Interfaces para tipagem
interface Disciplina {
  id: string
  nome: string
  codigo: string
  cargaHoraria: number
}

interface MatrizCurricular {
  id: string
  nome: string
  idCurso: string
  disciplinas: Disciplina[]
}

interface Curso {
  id: string
  nome: string
  codigo: string
}

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
    useState<MatrizCurricular | null>(null)
  const [curso, setCurso] = useState<Curso | null>(null)

  const { data: matrizesCurriculares, isPending: isLoadingMatrizes } =
    useMatrizesCurricularesControllerFindAll()

  const { data: cursos, isPending: isLoadingCursos } =
    useCursosControllerFindAll()

  // Carrega os dados da matriz curricular e do curso associado
  useEffect(() => {
    if (matrizesCurriculares && cursos && id) {
      const matriz = matrizesCurriculares.find((m) => m.id === id)

      if (matriz) {
        // Converter para nosso tipo interno
        const matrizTipada: MatrizCurricular = {
          id: matriz.id,
          nome: matriz.nome,
          idCurso: matriz.idCurso,
          disciplinas: matriz.disciplinas.map((d) => ({
            id: d.id,
            nome: d.nome,
            codigo: d.codigo || "",
            cargaHoraria: d.cargaHoraria,
          })),
        }

        setMatrizCurricular(matrizTipada)

        const cursoAssociado = cursos.find((c) => c.id === matriz.idCurso)
        if (cursoAssociado) {
          // Converter para nosso tipo interno
          const cursoTipado: Curso = {
            id: cursoAssociado.id,
            nome: cursoAssociado.nome,
            codigo: cursoAssociado.codigo,
          }
          setCurso(cursoTipado)
        }
      }
    }
  }, [matrizesCurriculares, cursos, id])

  // Verifica se está carregando
  const isLoading = isLoadingMatrizes || isLoadingCursos

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
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Card className="border-l-primary/50 border-l-4">
              <CardHeader className="flex flex-row items-center gap-2">
                <GraduationCap className="text-primary mr-1 h-5 w-5" />
                <CardTitle className="text-lg">Curso Associado</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-medium">{curso?.nome || "Não disponível"}</p>
                <p className="text-muted-foreground text-sm">
                  Código: {curso?.codigo || "N/A"}
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
                  Total de disciplinas nesta matriz
                </p>
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
                  <CardTitle>Detalhes do Curso</CardTitle>
                  <CardDescription>
                    Informações sobre o curso associado a esta matriz curricular
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Nome do Curso
                  </h3>
                  <p className="text-lg font-medium">
                    {curso?.nome || "Não disponível"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Código do Curso
                  </h3>
                  <p className="text-lg font-medium">
                    {curso?.codigo || "Não disponível"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Disciplinas */}
          <Card className="overflow-hidden pt-0 transition-all duration-300 hover:shadow-md">
            <CardHeader className="from-primary/10 bg-gradient-to-r to-transparent pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 flex items-center justify-center rounded-full p-2">
                  <BookOpen className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Disciplinas</CardTitle>
                  <CardDescription>
                    Disciplinas incluídas nesta matriz curricular
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {matrizCurricular && matrizCurricular?.disciplinas?.length > 0 ?
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="font-semibold">Código</TableHead>
                        <TableHead className="font-semibold">
                          Carga Horária
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matrizCurricular?.disciplinas.map(
                        (disciplina: Disciplina) => (
                          <TableRow
                            key={disciplina.id}
                            className="hover:bg-muted/60 transition-colors"
                          >
                            <TableCell className="font-medium">
                              {disciplina.nome}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {disciplina.codigo}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-primary/10 border-primary/30 text-primary flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                              >
                                <Clock className="h-3 w-3" />
                                {disciplina.cargaHoraria}h
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              : <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg py-12 text-center">
                  <BookOpen className="text-muted-foreground mb-4 h-12 w-12 opacity-40" />
                  <p className="text-muted-foreground mb-2 text-lg font-medium">
                    Nenhuma disciplina cadastrada
                  </p>
                  <p className="text-muted-foreground max-w-md text-sm">
                    Esta matriz curricular ainda não possui disciplinas
                    associadas.
                  </p>
                </div>
              }
            </CardContent>
            <CardFooter className="bg-muted/10 flex justify-between border-t">
              <div className="text-muted-foreground text-sm">
                Total: {matrizCurricular?.disciplinas?.length || 0} disciplinas
              </div>
            </CardFooter>
          </Card>
        </>
      }
    </div>
  )
}
