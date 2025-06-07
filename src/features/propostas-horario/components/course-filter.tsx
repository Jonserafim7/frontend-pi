import { Filter } from "lucide-react"
import { usePropostas } from "../hooks/use-propostas"
import { useMemo } from "react"

interface CourseFilterProps {
  selectedCourse: string
  onCourseChange: (course: string) => void
  disabled?: boolean
}

/**
 * Componente independente para filtro de cursos
 * Busca cursos automaticamente das propostas existentes
 */
export function CourseFilter({
  selectedCourse,
  onCourseChange,
  disabled = false,
}: CourseFilterProps) {
  // Buscar propostas (React Query faz cache automático)
  const { propostas, isLoading } = usePropostas({
    enabled: true,
  })

  // Extrair cursos únicos
  const courses = useMemo(() => {
    if (!propostas.length) return []
    const courseNames = propostas.map((p) => p.curso.nome)
    return Array.from(new Set(courseNames)).sort()
  }, [propostas])

  if (isLoading || courses.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="text-muted-foreground h-4 w-4" />
        <label
          htmlFor="course-filter"
          className="text-sm font-medium"
        >
          Filtrar por curso:
        </label>
      </div>

      <select
        id="course-filter"
        value={selectedCourse}
        onChange={(e) => onCourseChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
      >
        <option value="">Todos os cursos</option>
        {courses.map((course) => (
          <option
            key={course}
            value={course}
          >
            {course}
          </option>
        ))}
      </select>

      {selectedCourse && (
        <span className="text-muted-foreground text-xs">
          Filtrado por: {selectedCourse}
        </span>
      )}
    </div>
  )
}

/**
 * Hook customizado para extrair cursos únicos de propostas (mantido para compatibilidade)
 */
export function useUniqueCourses(propostas: { curso: { nome: string } }[]) {
  const courses = propostas.map((p) => p.curso.nome)
  return Array.from(new Set(courses)).sort()
}
