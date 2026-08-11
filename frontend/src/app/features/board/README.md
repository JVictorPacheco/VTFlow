---
tags:
  - frontend
  - features
  - board
  - kanban
---

# Board Feature (Kanban)

## Objetivo do Módulo

Visualização Kanban de um board específico, com colunas, cards arrastáveis e gestão completa de cards.

## Funcionalidades

### `BoardComponent` (`board.component.ts`) — 584 linhas

- **Kanban board**: Colunas lado a lado com scroll horizontal
- **Drag and drop manual**: Implementado com eventos `dragstart`, `dragover`, `drop` nativos do DOM
- **Header**: Nome do board, voltar para lista, link para colunas, toggle de tema, logout
- **Cards**: Exibição com título, etiquetas (coloridas), prioridade (ícone/emoji), data de vencimento, progresso de subtarefas
- **Gerenciamento de colunas**: Link para `ColumnsManagerComponent`
- **Criação de card**: Abre `CardFormComponent` em modal

### `CardFormComponent` (`card-form.component.ts`) — 178 linhas

- **Modal de criação**: Título, descrição, prioridade, data de vencimento, etiquetas
- **Edição**: Mesmo formulário reaproveitado para editar card existente
- **Labels**: Seleção múltipla com checkboxes coloridas
- Prioridade padrão: `Medium`
- Data via `<input type="date">`

### `CardDetailComponent` (`card-detail.component.ts`) — 430 linhas

- **Modal de detalhes**: Exibe informações completas do card
- **Abas**: Subtarefas | Comentários | Timeline (atividades)
- **Subtarefas**: Lista com checkbox toggle, criar, renomear, deletar
- **Comentários**: Lista com data, criar, editar, deletar
- **Timeline**: Log de atividades em ordem cronológica
- **Ações do card**: Editar (abre `CardFormComponent`), mover coluna, excluir

## Dependências Internas

- [[../../core/services/README]] — `CardService`, `ColumnService`, `BoardService`, `LabelService`, `SubtaskService`, `CommentService`, `ActivityService`, `ThemeService`
- [[../../core/services/README]] — `AuthService` (logout)

## Dependências Externas

- `@angular/common` — `DatePipe`
- `@angular/forms` — ReactiveFormsModule, FormBuilder

## Rota

| Rota | Componente | Auth |
|---|---|---|
| `/boards/:id` | `BoardComponent` | JWT |

## Fluxos Importantes

### Drag and Drop
```
[dragstart] → seta dataTransfer com cardId
[dragover]  → previne default, destaca coluna alvo
[drop]      → obtém cardId e columnId → CardService.move(cardId, columnId)
           → atualiza estado local (move card entre arrays de colunas)
```

> **Hipótese**: O reorder dentro da mesma coluna usa `CardService.reorder()`, que recalcula a ordem de todos os cards da coluna no backend.

### Criação de Card
```
[+ Card] → abre CardForm modal → preenche → CardService.create({title, description, priority, dueDate, columnId, labelIds})
  → POST /cards
  → backend cria Card + associa Labels + loga CardCreated e LabelAdded
  → adiciona card ao estado local da coluna
```

### Abas no CardDetail
```
[Subtarefas]: SubtaskService.getAll/create/toggle/rename/delete
[Comentários]: CommentService.getAll/create/delete
[Timeline]: ActivityService.getAll (read-only)
```

## Observações Técnicas

- **Drag and drop sem biblioteca**: Usa HTML5 Drag and Drop API nativa. Sem suporte a touch devices. Para mobile, considerar `@angular/cdk/drag-drop`.
- **Estado local por coluna**: Cards são agrupados em um Map `columnId → Card[]`. Reatividade via `signal()`.
- **Múltiplos modais**: BoardComponent gerencia 2 modais (CardForm, CardDetail). Abertura/fechamento controlado por signals.
- **Recarregamento**: Ao mover card, o estado local é atualizado sem refetch completo.
