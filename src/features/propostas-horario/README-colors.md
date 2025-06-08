# Mapeamento de Cores - Módulo Propostas Horário

Este documento descreve como as cores do design system são utilizadas no módulo de propostas de horário.

## Status da Proposta

### DRAFT (Rascunho)

- **Cor principal**: `text-primary`
- **Background**: `bg-primary/10`
- **Border**: `border-primary/30`
- **Hover**: `hover:bg-primary/20`

### PENDENTE_APROVACAO (Pendente)

- **Cor principal**: `text-chart-2`
- **Background**: `bg-chart-2/10`
- **Border**: `border-chart-2/30`
- **Hover**: `hover:bg-chart-2/20`

### APROVADA

- **Cor principal**: `text-accent-foreground`
- **Background**: `bg-accent/10`
- **Border**: `border-accent/30`
- **Hover**: `hover:bg-accent/20`

### REJEITADA

- **Cor principal**: `text-destructive`
- **Background**: `bg-destructive/10`
- **Border**: `border-destructive/30`
- **Hover**: `hover:bg-destructive/20`

## Elementos de Interface

### Botões Primários

- **Submeter**: `bg-primary hover:bg-primary/90`
- **Aprovar**: `bg-accent hover:bg-accent/90`
- **Rejeitar**: `variant="destructive"`
- **Reabrir**: `bg-chart-2 hover:bg-chart-2/90`

### Ícones de Status

- **Aprovado**: `text-accent-foreground`
- **Rejeitado**: `text-destructive`
- **Pendente**: `text-chart-2`
- **Draft**: `text-primary`

### Alerts

- **Sucesso**: `border-accent/30 bg-accent/10 text-accent-foreground`
- **Erro**: `border-destructive/30 bg-destructive/10 text-destructive`
- **Aviso**: `border-chart-2/30 bg-chart-2/10 text-chart-2`
- **Info**: `border-primary/30 bg-primary/10 text-primary`

## Rationale

Este mapeamento segue os padrões do design system Tailwind/shadcn:

- **primary**: Cor principal da marca para elementos neutros e ações primárias
- **accent**: Verde, usado para sucesso e aprovações
- **destructive**: Vermelho, usado para ações destrutivas e rejeições
- **chart-2**: Laranja/amarelo, usado para avisos e estados pendentes
- **muted**: Cinza, usado para elementos secundários e backgrounds

Todas as opacidades (10%, 20%, 30%) garantem consistência visual e acessibilidade.
