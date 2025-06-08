# React Query Hooks - Propostas de Horário

## Arquitetura

Este módulo contém hooks customizados para gerenciamento de propostas de horário utilizando React Query e a API gerada pelo Orval.

### Benefícios da Abordagem

1. **Hooks gerados automaticamente**: O Orval gera automaticamente todos os hooks base a partir da OpenAPI spec
2. **Camada de abstração**: Os hooks customizados fornecem uma interface mais simples e específica para o domínio
3. **Query Key Management**: Utiliza as funções de query key geradas pelo Orval para consistência
4. **Cache Invalidation**: Invalidação inteligente do cache React Query após mutations
5. **Error Handling**: Tratamento de erros centralizado com toast notifications
6. **TypeScript**: Tipagem completa com tipos gerados automaticamente

### Hooks Disponíveis

#### Queries (GET)

- `usePropostasHorarioList()` - Lista todas as propostas filtradas por papel do usuário
- `usePropostaHorario(id)` - Busca uma proposta específica por ID

#### Mutations (POST/PUT/PATCH/DELETE)

- `useCreateProposta()` - Criar nova proposta
- `useUpdateProposta()` - Atualizar proposta (apenas DRAFT)
- `useDeleteProposta()` - Remover proposta (apenas DRAFT)
- `useSubmitProposta()` - Submeter proposta para aprovação
- `useApproveProposta()` - Aprovar proposta (apenas diretores)
- `useRejectProposta()` - Rejeitar proposta (apenas diretores)
- `useReopenProposta()` - Reabrir proposta rejeitada

### Cache Strategy

Após mutations, o cache é invalidado de forma inteligente:

- **Lista de propostas**: Sempre invalidada para refletir mudanças
- **Item específico**: Invalidado quando a mutation retorna o item atualizado
- **Query Keys**: Utiliza funções geradas pelo Orval para consistência

### Exemplo de Uso

```typescript
import {
  usePropostasHorarioList,
  useCreateProposta,
  usePropostaHorario
} from '@/features/propostas-horario/hooks'

function PropostasPage() {
  // Lista todas as propostas
  const { data: propostas, isLoading } = usePropostasHorarioList()

  // Mutation para criar proposta
  const createProposta = useCreateProposta()

  // Query para proposta específica
  const { data: proposta } = usePropostaHorario(propostaId)

  const handleCreate = () => {
    createProposta.mutate({
      data: {
        cursoId: 'curso-id',
        periodoLetivoId: 'periodo-id'
      }
    })
  }

  return (
    // JSX aqui
  )
}
```

### Tipos TypeScript

Todos os tipos são exportados automaticamente:

- `PropostaHorarioResponseDto` - Tipo completo da resposta
- `CreatePropostaHorarioDto` - Tipo para criação
- `UpdatePropostaHorarioDto` - Tipo para atualização
- Etc.
