import { useState, useEffect, useMemo, useCallback, useRef } from "react"

interface UseSearchOptions {
  /** Delay para debouncing em milissegundos (padrão: 300ms) */
  debounceDelay?: number
  /** Texto mínimo para iniciar a busca (padrão: 1) */
  minSearchLength?: number
  /** Se deve pesquisar mesmo com string vazia (padrão: true) */
  searchOnEmpty?: boolean
}

interface UseSearchResult<T> {
  /** Valor atual do campo de busca */
  searchValue: string
  /** Valor debounced da busca */
  debouncedValue: string
  /** Se está atualmente realizando busca */
  isSearching: boolean
  /** Resultados filtrados */
  filteredResults: T[]
  /** Função para atualizar o valor da busca */
  setSearchValue: (value: string) => void
  /** Função para limpar a busca */
  clearSearch: () => void
  /** Número total de resultados */
  totalResults: number
  /** Se há busca ativa */
  hasActiveSearch: boolean
  /** Referência para o input de busca (para focus management) */
  searchInputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * Custom hook para gerenciar busca com debouncing e acessibilidade
 */
export function useSearch<T>(
  data: T[],
  searchFn: (item: T, searchTerm: string) => boolean,
  options: UseSearchOptions = {},
): UseSearchResult<T> {
  const {
    debounceDelay = 300,
    minSearchLength = 1,
    searchOnEmpty = true,
  } = options

  const [searchValue, setSearchValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounce logic
  useEffect(() => {
    setIsSearching(true)

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedValue(searchValue)
      setIsSearching(false)
    }, debounceDelay)

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchValue, debounceDelay])

  // Filter results based on search
  const filteredResults = useMemo(() => {
    const searchTerm = debouncedValue.toLowerCase().trim()

    // If no search term and searchOnEmpty is false, return all data
    if (!searchTerm && !searchOnEmpty) {
      return data
    }

    // If search term is too short, return all data or empty array
    if (searchTerm && searchTerm.length < minSearchLength) {
      return searchOnEmpty ? data : []
    }

    // If no search term but searchOnEmpty is true, return all data
    if (!searchTerm) {
      return data
    }

    // Filter data using the provided search function
    return data.filter((item) => searchFn(item, searchTerm))
  }, [data, debouncedValue, searchFn, minSearchLength, searchOnEmpty])

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchValue("")
    setDebouncedValue("")
    setIsSearching(false)

    // Focus the input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const hasActiveSearch = debouncedValue.length >= minSearchLength
  const totalResults = filteredResults.length

  return {
    searchValue,
    debouncedValue,
    isSearching,
    filteredResults,
    setSearchValue,
    clearSearch,
    totalResults,
    hasActiveSearch,
    searchInputRef,
  }
}

/**
 * Função utilitária para busca em turmas
 */
export const searchTurmas = (turma: any, searchTerm: string): boolean => {
  const term = searchTerm.toLowerCase()

  // Buscar em diferentes campos da turma
  return (
    turma.codigo?.toLowerCase().includes(term) ||
    turma.disciplinaOfertada?.disciplina?.nome?.toLowerCase().includes(term) ||
    turma.disciplinaOfertada?.disciplina?.codigo?.toLowerCase().includes(term) ||
    turma.professor?.nome?.toLowerCase().includes(term) ||
    turma.turno?.toLowerCase().includes(term) ||
    turma.curso?.nome?.toLowerCase().includes(term) ||
    turma.curso?.codigo?.toLowerCase().includes(term)
  )
}

/**
 * Função utilitária para busca em professores
 */
export const searchProfessores = (
  professor: any,
  searchTerm: string,
): boolean => {
  const term = searchTerm.toLowerCase()

  return (
    professor.nome?.toLowerCase().includes(term) ||
    professor.email?.toLowerCase().includes(term) ||
    professor.username?.toLowerCase().includes(term)
  )
}

/**
 * Função utilitária para busca em cursos
 */
export const searchCursos = (curso: any, searchTerm: string): boolean => {
  const term = searchTerm.toLowerCase()

  return (
    curso.nome?.toLowerCase().includes(term) ||
    curso.codigo?.toLowerCase().includes(term) ||
    curso.descricao?.toLowerCase().includes(term)
  )
}
