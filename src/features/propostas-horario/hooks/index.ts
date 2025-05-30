// Hooks para propostas de horário
// Adicionar hooks conforme necessário

export {
  useAlocacoes,
  useAlocacoesPorPeriodo,
  useAlocacoesPorTurma,
  useAlocacoesPorProfessor,
} from "./useAlocacoes"
export type { UseAlocacoesOptions, UseAlocacoesReturn } from "./useAlocacoes"

export {
  useConflicts,
  useCriticalConflicts,
  useAutoResolvableConflicts,
  useAllocationConflicts,
} from "./useConflicts"
export type { UseConflictsOptions, UseConflictsReturn } from "./useConflicts"
