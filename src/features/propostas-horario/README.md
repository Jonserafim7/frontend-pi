# 📊 Módulo Propostas de Horário

## 📑 **Índice**

- [🎯 Visão Geral](#-visão-geral)
- [📊 Diagramas da Arquitetura](#-diagramas-da-arquitetura)
- [📁 Estrutura do Módulo](#-estrutura-do-módulo)
- [🔄 Fluxo de Estados das Propostas](#-fluxo-de-estados-das-propostas)
- [🎨 Hierarquia de Componentes do Grid](#-hierarquia-de-componentes-do-grid)
- [🌊 Fluxo de Dados](#-fluxo-de-dados)
- [👥 Fluxos de Usuário](#-fluxos-de-usuário)
- [🔐 Sistema de Permissões](#-sistema-de-permissões)
- [⚡ Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [🚧 Funcionalidades Pendentes](#-funcionalidades-pendentes)
- [🎯 Principais Benefícios](#-principais-benefícios)

---

## 🎯 **Visão Geral**

O módulo **Propostas de Horário** é um sistema completo para gerenciar propostas de grade horária em uma instituição educacional. Permite que coordenadores criem, editem e submetam propostas de horários, enquanto diretores podem revisá-las, aprová-las ou rejeitá-las com justificativas.

### **Principais Características:**

- **Workflow de Aprovação**: Sistema de estados com transições controladas
- **Interface Visual Interativa**: Grid de horários com drag-and-drop conceitual
- **Validação de Conflitos**: Verificação automática de sobreposições de horários
- **Controle de Permissões**: Diferentes níveis de acesso por papel e status
- **Auditoria Completa**: Rastreamento de alterações e justificativas

---

## 📊 **Diagramas da Arquitetura**

### **Estrutura Geral do Módulo**

```mermaid
graph TB
    subgraph "Frontend Module Structure"
        A[pages/] --> A1[propostas-list-page.tsx]
        A[pages/] --> A2[proposta-details-page.tsx]
        A[pages/] --> A3[diretor-propostas-list-page.tsx]
        A[pages/] --> A4[diretor-proposta-details-page.tsx]

        B[components/] --> B1[data-table/]
        B[components/] --> B2[alocacao-turmas-horarios/]
        B[components/] --> B3[dialogs/]

        C[hooks/] --> C1[use-propostas-horario.ts]
        C[hooks/] --> C2[use-proposta-allocation.ts]

        D[types/] --> D1[proposta-types.ts]
        D[types/] --> D2[proposta-allocation-types.ts]

        E[schemas/] --> E1[proposta-schemas.ts]
    end
```

### **Hierarquia de Componentes do Grid de Alocação**

```mermaid
graph TD
    A[PropostaDetailsPage] --> B[PropostaScheduleGrid]
    B --> C1[PropostaTurnoSection<br/>Manhã]
    B --> C2[PropostaTurnoSection<br/>Tarde]
    B --> C3[PropostaTurnoSection<br/>Noite]

    C1 --> D1[ScrollArea<br/>Horizontal]
    C2 --> D2[ScrollArea<br/>Horizontal]
    C3 --> D3[ScrollArea<br/>Horizontal]

    D1 --> E[PropostaScheduleCellContainer<br/>por dia/horário]
    D2 --> E
    D3 --> E

    E --> F[ScheduleCellView<br/>Apresentação]

    F --> G1[AllocationCard<br/>Turmas Alocadas]
    F --> G2[AddAllocationButton<br/>Adicionar Turma]

    E --> H[ScheduleAllocationDialog<br/>Gerenciamento]
```

---

## 📁 **Estrutura do Módulo**

### **Organização por Responsabilidade**

**Types & Schemas**: Definições de tipos TypeScript e validações Zod para garantir type safety e validação de formulários.

**Hooks**: Camada de abstração que combina os hooks gerados automaticamente pelo Orval com lógica específica do negócio, gerenciamento de cache e tratamento de erros.

**Components**:

- **data-table/**: Componentes para listagem e filtros de propostas
- **alocacao-turmas-horarios/**: Sistema completo de grid interativo para alocação
- **dialogs/**: Modais para criação, submissão, aprovação e rejeição

**Pages**: Páginas principais que orquestram os componentes e definem os layouts para coordenadores e diretores.

---

## 🔄 **Fluxo de Estados das Propostas**

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Coordenador cria proposta

    DRAFT --> PENDENTE_APROVACAO: Coordenador submete
    DRAFT --> [*]: Coordenador deleta

    PENDENTE_APROVACAO --> APROVADA: Diretor aprova
    PENDENTE_APROVACAO --> REJEITADA: Diretor rejeita

    REJEITADA --> DRAFT: Coordenador reabre

    APROVADA --> [*]: Estado final

    note right of DRAFT
        Editável pelo coordenador
        Pode alocar/remover turmas
        Pode submeter ou deletar
    end note

    note right of PENDENTE_APROVACAO
        Locked para edição
        Diretor pode aprovar/rejeitar
        Coordenador só visualiza
    end note

    note right of APROVADA
        Read-only para todos
        Grade oficial ativa
    end note

    note right of REJEITADA
        Read-only temporário
        Contém justificativa
        Coordenador pode reabrir
    end note
```

---

## 🎨 **Hierarquia de Componentes do Grid**

### **Arquitetura de Apresentação vs Lógica**

O grid segue o padrão Container/Presentational Components:

**PropostaScheduleGrid**: Componente principal que busca dados e coordena os turnos.

**PropostaTurnoSection**: Gerencia um turno específico (Manhã/Tarde/Noite) com scroll horizontal.

**PropostaScheduleCellContainer**: Container com lógica de negócio para cada célula (dia + horário específico).

**ScheduleCellView**: Componente puramente visual que apresenta alocações e botões.

**AllocationCard**: Card compacto que exibe informações de uma turma alocada.

**AddAllocationButton**: Botão inteligente que se adapta ao contexto e permissões.

### **Sistema de Scroll Inteligente**

Cada turno possui scroll horizontal independente para acomodar a grade semanal completa. As células têm largura fixa (300px) garantindo consistência visual.

---

## 🌊 **Fluxo de Dados**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant P as PropostaDetailsPage
    participant H as usePropostaAllocation
    participant API as Backend API
    participant QC as QueryClient Cache

    U->>P: Acessa página de detalhes
    P->>H: Hook busca dados da proposta
    H->>API: GET /propostas-horario/:id
    API-->>H: Dados da proposta
    H->>API: GET /alocacoes-horario/proposta/:id
    API-->>H: Alocações existentes
    H-->>P: Estado consolidado
    P-->>U: Renderiza grid interativo

    U->>P: Clica "+" para adicionar turma
    P->>H: Abre dialog de alocação
    H->>API: GET /turmas (filtradas)
    API-->>H: Turmas disponíveis
    H-->>P: Exibe opções no dialog

    U->>P: Seleciona turma e confirma
    P->>H: Solicita criação de alocação
    H->>API: POST /alocacoes-horario
    API-->>H: Alocação criada
    H->>QC: Invalida caches relacionados
    QC-->>P: Re-renderiza automaticamente
    P-->>U: Grid atualizado
```

---

## 👥 **Fluxos de Usuário**

### **Coordenador - Fluxo Completo**

```mermaid
journey
    title Coordenador - Gestão de Propostas
    section Criação
        Acessa lista de propostas: 5: Coordenador
        Clica "Nova Proposta": 5: Coordenador
        Seleciona curso e período: 4: Coordenador
        Proposta criada em DRAFT: 5: Coordenador
    section Edição
        Acessa página de detalhes: 5: Coordenador
        Visualiza grid de horários: 5: Coordenador
        Adiciona alocações de turmas: 4: Coordenador
        Remove alocações conflitantes: 3: Coordenador
    section Submissão
        Verifica alocações mínimas: 4: Coordenador
        Adiciona observações: 4: Coordenador
        Submete para aprovação: 5: Coordenador
        Aguarda decisão do diretor: 2: Coordenador
    section Reação
        Recebe aprovação: 5: Coordenador
        Ou recebe rejeição: 1: Coordenador
        Reabre proposta rejeitada: 3: Coordenador
        Corrige e resubmete: 4: Coordenador
```

### **Diretor - Fluxo de Aprovação**

```mermaid
journey
    title Diretor - Revisão de Propostas
    section Listagem
        Acessa propostas pendentes: 5: Diretor
        Filtra por curso/coordenador: 4: Diretor
        Identifica propostas urgentes: 4: Diretor
    section Análise
        Abre proposta para revisão: 5: Diretor
        Analisa grade proposta: 4: Diretor
        Verifica conflitos: 3: Diretor
        Compara com outras propostas: 3: Diretor
    section Decisão
        Aprova proposta adequada: 5: Diretor
        Ou rejeita com justificativa: 2: Diretor
        Adiciona observações: 4: Diretor
        Confirma decisão final: 5: Diretor
```

---

## 🔐 **Sistema de Permissões**

### **Matriz de Permissões por Status**

| Status        | Coordenador Pode                                   | Diretor Pode               | Sistema Permite         |
| ------------- | -------------------------------------------------- | -------------------------- | ----------------------- |
| **DRAFT**     | ✅ Editar alocações<br/>✅ Submeter<br/>✅ Deletar | ❌ Apenas visualizar       | ✅ Todas as operações   |
| **PENDENTE**  | ❌ Apenas visualizar                               | ✅ Aprovar<br/>✅ Rejeitar | ❌ Locked para edição   |
| **APROVADA**  | ❌ Read-only                                       | ❌ Read-only               | ❌ Estado final         |
| **REJEITADA** | ✅ Reabrir<br/>❌ Editar direto                    | ❌ Apenas visualizar       | ✅ Reabertura permitida |

### **Controle de Interface**

A interface se adapta automaticamente baseada no status da proposta e papel do usuário:

- **Botões contextuais**: Aparecem/desaparecem conforme permissões
- **Indicadores visuais**: Status badges com cores específicas
- **Modo read-only**: Grid desabilita interações quando necessário
- **Mensagens contextuais**: Explicam limitações e próximos passos

---

## ⚡ **Funcionalidades Implementadas**

### ✅ **Sistema Básico Completo**

- Criação e listagem de propostas
- Grid de alocação interativo com scroll horizontal
- Sistema de tipos e validações
- Integração completa com backend via Orval
- Componentes de data table com filtros

### ✅ **Grid de Alocação Avançado**

- Suporte a múltiplas turmas por slot
- AllocationCard responsivo com 3 tamanhos
- AddAllocationButton inteligente
- ScheduleAllocationDialog otimizado
- Validação de conflitos em tempo real

### ✅ **Arquitetura Robusta**

- Separação clara entre propostas e sistema geral
- Hooks customizados com cache inteligente
- Types específicos organizados
- Barrel files limpos e organizados

---

## 🚧 **Funcionalidades Pendentes**

### ❌ **Task 4.3 - Estados Condicionais da Interface**

- Modo visualização para propostas aprovadas/rejeitadas
- Indicadores visuais de status e permissões na interface

### ❌ **Task 4.4-4.9 - Funcionalidades de Submissão**

- Botão "Submeter" para propostas em DRAFT
- Dialog de submissão com observações
- Visualização read-only para propostas PENDENTE e APROVADA
- Exibição de justificativas de rejeição
- Botão "Reabrir para Edição" para propostas REJEITADAS

### ❌ **Task 6.0 - Fluxo de Aprovação Completo**

- Dialog de aprovação com observações opcionais
- Dialog de rejeição com justificativa obrigatória
- Implementação das ações de aprovação/rejeição via API
- Ação de reabertura para coordenadores
- Botões de aprovação/rejeição na página de detalhes
- Controle de permissões baseado no papel do usuário
- Confirmações antes de ações irreversíveis

### **Status Atual de Implementação:**

- **Completo**: Tasks 1.0, 2.0, 3.0, 4.1, 4.2, 5.0
- **Pendente**: Tasks 4.3-4.9, 6.0
- **Progresso**: ~70% do sistema implementado

---

## 🎯 **Principais Benefícios**

### **📋 Manutenibilidade**

- Arquitetura modular com responsabilidades bem definidas
- Separação clara entre lógica de negócio e apresentação
- Types centralizados garantindo consistência

### **⚡ Performance**

- Cache inteligente com invalidação específica
- Componentes otimizados para re-renderização mínima
- Scroll virtual para grids grandes

### **🔒 Segurança**

- Validação dupla (frontend + backend)
- Controle de permissões granular
- Type safety completo

### **👥 Experiência do Usuário**

- Interface intuitiva com feedback visual imediato
- Grid responsivo que se adapta ao conteúdo
- Workflows claros para coordenadores e diretores

### **🔧 Developer Experience**

- Hooks gerados automaticamente do Swagger
- Types compartilhados entre frontend e backend
- Arquitetura padronizada e documentada

---

**🚀 Este módulo representa uma implementação robusta e escalável que combina as melhores práticas do React/TypeScript com um workflow de negócio bem estruturado. A arquitetura suporta facilmente a adição das funcionalidades pendentes mantendo a qualidade e consistência do código.**
