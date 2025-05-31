import { CreateAlocacaoHorarioDtoDiaDaSemana } from "@/api-generated/model"

// Alias para melhor legibilidade
export type DiaSemana = CreateAlocacaoHorarioDtoDiaDaSemana

/**
 * Representa o slot de horário selecionado para alocação
 * Usado quando o usuário clica em uma célula da grade de horários
 */
export interface SlotSelecionado {
  diaDaSemana: DiaSemana
  horaInicio: string
  horaFim: string
}

/**
 * Filtros aplicados no client-side para visualização
 * Estes filtros são aplicados após os dados serem carregados pelo React Query
 */
export interface FiltrosVisualizacao {
  /** Filtro por texto nas disciplinas */
  textoDisciplina?: string
  /** Filtro por professor específico */
  idProfessor?: string
  /** Filtro por turno (manhã, tarde, noite) */
  turno?: "MANHA" | "TARDE" | "NOITE"
  /** Mostrar apenas conflitos */
  apenasConflitos?: boolean
}

/**
 * Estado local da UI gerenciado pelo PropostaContext
 * NÃO inclui dados do servidor - esses são gerenciados pelo React Query
 */
export interface PropostaContextState {
  /** ID do curso (inferido automaticamente do coordenador logado) */
  idCurso: string | null

  /** ID do período letivo selecionado pelo usuário */
  idPeriodoLetivoSelecionado: string | null

  /** ID da proposta de horário atual em edição (status DRAFT) */
  idPropostaHorarioAtual: string | null

  /** Slot/horário selecionado para nova alocação */
  slotSelecionadoParaAlocacao: SlotSelecionado | null

  /** Controla visibilidade do popup de seleção de turmas */
  isSlotTurmasPopupOpen: boolean

  /** Controla visibilidade do modal de detalhes da alocação */
  isAlocacaoDetailModalOpen: boolean

  /** ID da alocação sendo visualizada/editada no modal */
  idAlocacaoSelecionada: string | null

  /** Filtros aplicados na visualização (client-side) */
  filtrosVisualizacao: FiltrosVisualizacao

  /** Modo de visualização da grade */
  modoVisualizacao: "GRADE" | "LISTA"

  /** Mostra/oculta turmas disponíveis para alocação */
  isTurmasDisponiveisVisible: boolean

  /** Estado de drag and drop */
  isDragging: boolean
  itemBeingDragged: string | null
}

/**
 * Ações disponíveis no contexto para manipular o estado local
 * Estas ações NÃO fazem operações assíncronas - apenas atualizam estado local
 */
export interface PropostaContextActions {
  /** Define o ID do curso (normalmente inferido automaticamente) */
  setIdCurso: (idCurso: string | null) => void

  /** Define o período letivo selecionado */
  setIdPeriodoLetivoSelecionado: (idPeriodoLetivo: string | null) => void

  /** Define a proposta de horário atual em edição */
  setIdPropostaHorarioAtual: (idProposta: string | null) => void

  /** Define o slot selecionado para alocação */
  setSlotSelecionadoParaAlocacao: (slot: SlotSelecionado | null) => void

  /** Controla popup de seleção de turmas */
  setIsSlotTurmasPopupOpen: (open: boolean) => void

  /** Controla modal de detalhes da alocação */
  setIsAlocacaoDetailModalOpen: (open: boolean) => void

  /** Define a alocação selecionada para visualização */
  setIdAlocacaoSelecionada: (idAlocacao: string | null) => void

  /** Atualiza filtros de visualização */
  updateFiltrosVisualizacao: (filtros: Partial<FiltrosVisualizacao>) => void

  /** Limpa todos os filtros */
  clearFiltrosVisualizacao: () => void

  /** Alterna modo de visualização */
  setModoVisualizacao: (modo: "GRADE" | "LISTA") => void

  /** Controla visibilidade do painel de turmas disponíveis */
  setIsTurmasDisponiveisVisible: (visible: boolean) => void

  /** Inicia drag and drop */
  startDragging: (itemId: string) => void

  /** Finaliza drag and drop */
  endDragging: () => void

  /** Abre modal/popup para criar nova alocação no slot especificado */
  openSlotForAllocation: (slot: SlotSelecionado) => void

  /** Fecha modal/popup de alocação e limpa seleção */
  closeAllocationModal: () => void

  /** Abre modal de detalhes de uma alocação existente */
  openAlocacaoDetails: (idAlocacao: string) => void

  /** Fecha modal de detalhes */
  closeAlocacaoDetails: () => void
}

/**
 * Configurações do provider - props aceitas pelo PropostaProvider
 */
export interface PropostaProviderProps {
  children: React.ReactNode
  /** ID do curso inicial (opcional - pode ser inferido do usuário logado) */
  initialIdCurso?: string
  /** ID do período letivo inicial (opcional) */
  initialIdPeriodoLetivo?: string
}

/**
 * Tipo completo do contexto - estado + ações
 * Usado pelo hook usePropostaContext
 */
export type PropostaContextType = PropostaContextState & PropostaContextActions

/**
 * Ações do reducer para gerenciar o estado
 */
export type PropostaContextAction =
  | { type: "SET_ID_CURSO"; payload: string | null }
  | { type: "SET_ID_PERIODO_LETIVO_SELECIONADO"; payload: string | null }
  | { type: "SET_ID_PROPOSTA_HORARIO_ATUAL"; payload: string | null }
  | {
      type: "SET_SLOT_SELECIONADO_PARA_ALOCACAO"
      payload: SlotSelecionado | null
    }
  | { type: "SET_IS_SLOT_TURMAS_POPUP_OPEN"; payload: boolean }
  | { type: "SET_IS_ALOCACAO_DETAIL_MODAL_OPEN"; payload: boolean }
  | { type: "SET_ID_ALOCACAO_SELECIONADA"; payload: string | null }
  | { type: "UPDATE_FILTROS_VISUALIZACAO"; payload: Partial<FiltrosVisualizacao> }
  | { type: "CLEAR_FILTROS_VISUALIZACAO" }
  | { type: "SET_MODO_VISUALIZACAO"; payload: "GRADE" | "LISTA" }
  | { type: "SET_IS_TURMAS_DISPONIVEIS_VISIBLE"; payload: boolean }
  | { type: "START_DRAGGING"; payload: string }
  | { type: "END_DRAGGING" }
  | { type: "OPEN_SLOT_FOR_ALLOCATION"; payload: SlotSelecionado }
  | { type: "CLOSE_ALLOCATION_MODAL" }
  | { type: "OPEN_ALOCACAO_DETAILS"; payload: string }
  | { type: "CLOSE_ALOCACAO_DETAILS" }

/**
 * Estado inicial padrão do contexto
 */
export const initialPropostaContextState: PropostaContextState = {
  idCurso: null,
  idPeriodoLetivoSelecionado: null,
  idPropostaHorarioAtual: null,
  slotSelecionadoParaAlocacao: null,
  isSlotTurmasPopupOpen: false,
  isAlocacaoDetailModalOpen: false,
  idAlocacaoSelecionada: null,
  filtrosVisualizacao: {},
  modoVisualizacao: "GRADE",
  isTurmasDisponiveisVisible: true,
  isDragging: false,
  itemBeingDragged: null,
}
