import { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, X } from "lucide-react"
import { TurmaCard } from "../components/turma-card"
import { CreateTurmaModal } from "../components/create-turma-modal"
import { EditTurmaModal } from "../components/edit-turma-modal"
import { AtribuirProfessorModal } from "../components/atribuir-professor-modal"
import { DeleteTurmaModal } from "../components/delete-turma-modal"
import { useTurmas, useRemoverProfessor } from "../hooks/use-turmas"
import type { TurmaResponseDto } from "@/api-generated/model"

/**
 * Página para listagem e gestão de turmas
 */
export function TurmasListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [atribuirProfessorModalOpen, setAtribuirProfessorModalOpen] =
    useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<TurmaResponseDto | null>(
    null,
  )

  // Buscar todas as turmas
  const { data: turmas, isLoading, error, refetch } = useTurmas()

  // Hook para remover professor
  const removerProfessorMutation = useRemoverProfessor()

  // Aplicar filtro da URL ao carregar a página
  useEffect(() => {
    const filtroFromUrl = searchParams.get("filtro")
    if (filtroFromUrl) {
      setSearchTerm(decodeURIComponent(filtroFromUrl))
    }
  }, [searchParams])

  // Função para limpar filtros
  const handleClearFilter = () => {
    setSearchTerm("")
    // Remove o parâmetro filtro da URL
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete("filtro")
    setSearchParams(newSearchParams)
  }

  // Filtrar turmas pelo termo de busca
  const filteredTurmas = turmas?.filter((turma) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      turma.codigoDaTurma.toLowerCase().includes(searchLower) ||
      turma.disciplinaOfertada?.disciplina?.nome
        ?.toLowerCase()
        .includes(searchLower) ||
      turma.disciplinaOfertada?.disciplina?.codigo
        ?.toLowerCase()
        .includes(searchLower)
    )
  })

  const handleEdit = (turma: TurmaResponseDto) => {
    setSelectedTurma(turma)
    setEditModalOpen(true)
  }

  const handleAtribuirProfessor = (turma: TurmaResponseDto) => {
    setSelectedTurma(turma)
    setAtribuirProfessorModalOpen(true)
  }

  const handleRemoverProfessor = async (turma: TurmaResponseDto) => {
    try {
      await removerProfessorMutation.mutateAsync({
        id: turma.id,
      })
      // Atualizar lista após remoção
      refetch()
    } catch (error) {
      console.error("Erro ao remover professor:", error)
    }
  }

  const handleDelete = (turma: TurmaResponseDto) => {
    setSelectedTurma(turma)
    setDeleteModalOpen(true)
  }

  const handleCreateTurma = () => {
    setCreateModalOpen(true)
  }

  const handleCreateSuccess = () => {
    // Atualizar lista de turmas após criação
    refetch()
  }

  const handleEditSuccess = () => {
    // Atualizar lista de turmas após edição
    refetch()
    setSelectedTurma(null)
  }

  const handleAtribuirProfessorSuccess = () => {
    // Atualizar lista de turmas após atribuição
    refetch()
    setSelectedTurma(null)
  }

  const handleDeleteSuccess = () => {
    // Atualizar lista de turmas após deleção
    refetch()
    setSelectedTurma(null)
  }

  const handleEditModalClose = (open: boolean) => {
    setEditModalOpen(open)
    if (!open) {
      setSelectedTurma(null)
    }
  }

  const handleAtribuirProfessorModalClose = (open: boolean) => {
    setAtribuirProfessorModalOpen(open)
    if (!open) {
      setSelectedTurma(null)
    }
  }

  const handleDeleteModalClose = (open: boolean) => {
    setDeleteModalOpen(open)
    if (!open) {
      setSelectedTurma(null)
    }
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-destructive text-lg font-semibold">
                Erro ao carregar turmas
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Ocorreu um erro ao buscar as turmas. Tente novamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie as turmas das disciplinas ofertadas
          </p>
        </div>
        <Button
          onClick={handleCreateTurma}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Buscar por código da turma, disciplina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilter}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="animate-pulse"
            >
              <CardHeader>
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-1/2 rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="bg-muted h-3 rounded" />
                  <div className="bg-muted h-3 w-2/3 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resultados */}
      {!isLoading && (
        <>
          {/* Estatísticas */}
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="px-3 py-1"
            >
              {filteredTurmas?.length || 0} turma(s) encontrada(s)
            </Badge>
            {searchTerm && (
              <Badge
                variant="secondary"
                className="px-3 py-1"
              >
                Filtrado por: "{searchTerm}"
              </Badge>
            )}
          </div>

          {/* Lista de Turmas */}
          {filteredTurmas && filteredTurmas.length > 0 ?
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTurmas.map((turma) => (
                <TurmaCard
                  key={turma.id}
                  turma={turma}
                  onEdit={handleEdit}
                  onAtribuirProfessor={handleAtribuirProfessor}
                  onRemoverProfessor={handleRemoverProfessor}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          : <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    Nenhuma turma encontrada
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {searchTerm ?
                      "Tente ajustar os filtros de busca."
                    : "Comece criando sua primeira turma."}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleCreateTurma}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Criar Primeira Turma
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          }
        </>
      )}

      {/* Modal de Criação */}
      <CreateTurmaModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de Edição */}
      <EditTurmaModal
        open={editModalOpen}
        onOpenChange={handleEditModalClose}
        turma={selectedTurma}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de Atribuir Professor */}
      <AtribuirProfessorModal
        open={atribuirProfessorModalOpen}
        onOpenChange={handleAtribuirProfessorModalClose}
        turma={selectedTurma}
        onSuccess={handleAtribuirProfessorSuccess}
      />

      {/* Modal de Deleção */}
      <DeleteTurmaModal
        open={deleteModalOpen}
        onOpenChange={handleDeleteModalClose}
        turma={selectedTurma}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
