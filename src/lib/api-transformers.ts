import type {
  PropostaHorarioResponseDto,
  PeriodoLetivoResponseDto,
  CursoResponseDto,
  UsuarioResponseDto,
} from "@/api-generated/model"

/**
 * Tipos transformados para uso na aplicação
 */
export interface PropostaHorarioFormatted {
  id: string
  codigo: string
  cursoNome: string
  periodoLetivo: string
  coordenadorNome: string
  status: string
  statusLabel: string
  statusColor: string
  dataCriacao: Date
  dataAtualizacao: Date
  dataEnvio?: Date
  dataAprovacao?: Date
  observacoesCoordenador?: string
  observacoesDiretor?: string
  justificativaRejeicao?: string
  canEdit: boolean
  canSubmit: boolean
  canApprove: boolean
  canReject: boolean
}

export interface PeriodoLetivoFormatted {
  id: string
  descricao: string
  ano: number
  semestre: number
  status: string
  statusLabel: string
  statusColor: string
  dataInicio: Date
  dataFim: Date
  isAtivo: boolean
  periodo: string // Ex: "2024/1"
}

export interface CursoFormatted {
  id: string
  nome: string
  codigo: string
  descricao?: string
  isAtivo: boolean
  dataCriacao: Date
  dataAtualizacao: Date
}

export interface UsuarioFormatted {
  id: string
  nome: string
  email: string
  papel: string
  papelLabel: string
  isAtivo: boolean
  dataCriacao: Date
  dataAtualizacao: Date
  avatarUrl?: string
  telefone?: string
}

/**
 * Mapeamento de status para labels e cores
 */
const STATUS_PROPOSTAS = {
  DRAFT: {
    label: "Rascunho",
    color: "text-yellow-600 bg-yellow-100",
  },
  PENDENTE_APROVACAO: {
    label: "Pendente",
    color: "text-blue-600 bg-blue-100",
  },
  APROVADA: {
    label: "Aprovada",
    color: "text-green-600 bg-green-100",
  },
  REJEITADA: {
    label: "Rejeitada",
    color: "text-red-600 bg-red-100",
  },
} as const

const STATUS_PERIODO_LETIVO = {
  ATIVO: {
    label: "Ativo",
    color: "text-green-600 bg-green-100",
  },
  INATIVO: {
    label: "Inativo",
    color: "text-gray-600 bg-gray-100",
  },
} as const

const PAPEIS_USUARIO = {
  ADMIN: {
    label: "Administrador",
    color: "text-purple-600 bg-purple-100",
  },
  DIRETOR: {
    label: "Diretor",
    color: "text-indigo-600 bg-indigo-100",
  },
  COORDENADOR: {
    label: "Coordenador",
    color: "text-blue-600 bg-blue-100",
  },
  PROFESSOR: {
    label: "Professor",
    color: "text-green-600 bg-green-100",
  },
} as const

/**
 * Utilitários para formatação de datas
 */
export function parseApiDate(dateString: string): Date {
  return new Date(dateString)
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateTimeForDisplay(date: Date): string {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Transformador para propostas de horário
 */
export function transformPropostaHorario(
  proposta: PropostaHorarioResponseDto,
  currentUserPapel?: string,
): PropostaHorarioFormatted {
  const statusInfo = STATUS_PROPOSTAS[
    proposta.status as keyof typeof STATUS_PROPOSTAS
  ] || {
    label: proposta.status,
    color: "text-gray-600 bg-gray-100",
  }

  // Determinar permissões baseadas no status e papel do usuário
  const isDraft = proposta.status === "DRAFT"
  const isPendente = proposta.status === "PENDENTE_APROVACAO"

  const isCoordenador = currentUserPapel === "COORDENADOR"
  const isDiretor = currentUserPapel === "DIRETOR" || currentUserPapel === "ADMIN"

  return {
    id: proposta.id,
    codigo: `PROP-${proposta.id.slice(0, 8)}`,
    cursoNome: proposta.curso?.nome || "Curso não informado",
    periodoLetivo:
      proposta.periodoLetivo ?
        `${proposta.periodoLetivo.ano}/${proposta.periodoLetivo.semestre}`
      : "Período não informado",
    coordenadorNome:
      proposta.coordenadorQueSubmeteu?.nome || "Coordenador não informado",
    status: proposta.status,
    statusLabel: statusInfo.label,
    statusColor: statusInfo.color,
    dataCriacao: parseApiDate(proposta.dataCriacao),
    dataAtualizacao: parseApiDate(proposta.dataAtualizacao),
    dataEnvio:
      proposta.dataSubmissao ?
        parseApiDate(proposta.dataSubmissao as unknown as string)
      : undefined,
    dataAprovacao:
      proposta.dataAprovacaoRejeicao ?
        parseApiDate(proposta.dataAprovacaoRejeicao as unknown as string)
      : undefined,
    observacoesCoordenador:
      proposta.observacoesCoordenador ?
        String(proposta.observacoesCoordenador)
      : undefined,
    observacoesDiretor:
      proposta.observacoesDiretor ?
        String(proposta.observacoesDiretor)
      : undefined,
    justificativaRejeicao:
      proposta.justificativaRejeicao ?
        String(proposta.justificativaRejeicao)
      : undefined,

    // Permissões
    canEdit: isDraft && isCoordenador,
    canSubmit: isDraft && isCoordenador,
    canApprove: isPendente && isDiretor,
    canReject: isPendente && isDiretor,
  }
}

/**
 * Transformador para períodos letivos
 */
export function transformPeriodoLetivo(
  periodo: PeriodoLetivoResponseDto,
): PeriodoLetivoFormatted {
  const statusInfo = STATUS_PERIODO_LETIVO[
    periodo.status as keyof typeof STATUS_PERIODO_LETIVO
  ] || {
    label: periodo.status,
    color: "text-gray-600 bg-gray-100",
  }

  return {
    id: periodo.id,
    descricao: `${periodo.ano}/${periodo.semestre}`,
    ano: periodo.ano,
    semestre: periodo.semestre,
    status: periodo.status,
    statusLabel: statusInfo.label,
    statusColor: statusInfo.color,
    dataInicio: parseApiDate(periodo.dataInicio),
    dataFim: parseApiDate(periodo.dataFim),
    isAtivo: periodo.status === "ATIVO",
    periodo: `${periodo.ano}/${periodo.semestre}`,
  }
}

/**
 * Transformador para cursos
 */
export function transformCurso(curso: CursoResponseDto): CursoFormatted {
  return {
    id: curso.id,
    nome: curso.nome,
    codigo: curso.codigo,
    descricao: undefined, // Não disponível na API atual
    isAtivo: true, // Assumindo ativo por padrão
    dataCriacao: parseApiDate(curso.dataCriacao),
    dataAtualizacao: parseApiDate(curso.dataAtualizacao),
  }
}

/**
 * Transformador para usuários
 */
export function transformUsuario(usuario: UsuarioResponseDto): UsuarioFormatted {
  const papelInfo = PAPEIS_USUARIO[
    usuario.papel as keyof typeof PAPEIS_USUARIO
  ] || {
    label: usuario.papel,
    color: "text-gray-600 bg-gray-100",
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    papelLabel: papelInfo.label,
    isAtivo: true, // Assumindo ativo por padrão
    dataCriacao: parseApiDate(usuario.dataCriacao),
    dataAtualizacao: parseApiDate(usuario.dataAtualizacao),
    telefone: undefined, // Não disponível na API atual
    // Avatar placeholder baseado nas iniciais
    avatarUrl: undefined,
  }
}

/**
 * Transformadores em lote para arrays
 */
export function transformPropostasHorario(
  propostas: PropostaHorarioResponseDto[],
  currentUserPapel?: string,
): PropostaHorarioFormatted[] {
  return propostas.map((proposta) =>
    transformPropostaHorario(proposta, currentUserPapel),
  )
}

export function transformPeriodosLetivos(
  periodos: PeriodoLetivoResponseDto[],
): PeriodoLetivoFormatted[] {
  return periodos.map(transformPeriodoLetivo)
}

export function transformCursos(cursos: CursoResponseDto[]): CursoFormatted[] {
  return cursos.map(transformCurso)
}

export function transformUsuarios(
  usuarios: UsuarioResponseDto[],
): UsuarioFormatted[] {
  return usuarios.map(transformUsuario)
}

/**
 * Utilitários para filtros e ordenação
 */
export function filterPropostasByStatus(
  propostas: PropostaHorarioFormatted[],
  status: string,
): PropostaHorarioFormatted[] {
  return propostas.filter((proposta) => proposta.status === status)
}

export function sortPropostasByDate(
  propostas: PropostaHorarioFormatted[],
  ascending = false,
): PropostaHorarioFormatted[] {
  return [...propostas].sort((a, b) => {
    const dateA = a.dataAtualizacao.getTime()
    const dateB = b.dataAtualizacao.getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

export function groupPropostasByStatus(
  propostas: PropostaHorarioFormatted[],
): Record<string, PropostaHorarioFormatted[]> {
  return propostas.reduce(
    (groups, proposta) => {
      const status = proposta.status
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(proposta)
      return groups
    },
    {} as Record<string, PropostaHorarioFormatted[]>,
  )
}

/**
 * Utilitários para validação de dados transformados
 */
export function validateTransformedProposta(
  proposta: PropostaHorarioFormatted,
): boolean {
  return !!(
    proposta.id &&
    proposta.cursoNome &&
    proposta.periodoLetivo &&
    proposta.status
  )
}

export function validateTransformedPeriodo(
  periodo: PeriodoLetivoFormatted,
): boolean {
  return !!(periodo.id && periodo.ano && periodo.semestre && periodo.status)
}

/**
 * Hook para transformação automática de dados da API
 */
export function useApiDataTransformers() {
  return {
    transformPropostaHorario,
    transformPeriodoLetivo,
    transformCurso,
    transformUsuario,
    transformPropostasHorario,
    transformPeriodosLetivos,
    transformCursos,
    transformUsuarios,
    filterPropostasByStatus,
    sortPropostasByDate,
    groupPropostasByStatus,
    validateTransformedProposta,
    validateTransformedPeriodo,
  }
}
