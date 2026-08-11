---
tags:
  - frontend
  - features
  - columns
---

# Columns Feature

## Objetivo do Módulo

Tela de gerenciamento de colunas de um board: criação, renomeação, reordenação e exclusão.

## Funcionalidades

### `ColumnsManagerComponent` (`columns-manager.component.ts`) — 237 linhas

- **Listagem**: Colunas ordenadas por `Order`
- **Criação**: Input com nome, botão "+" para adicionar
- **Renomeação inline**: Clique no nome transforma em input editável
- **Reordenação**: Botões ↑ ↓ para mover coluna para cima/baixo (chama `ColumnService.reorder`)
- **Exclusão**: Bloqueada se houver cards na coluna (backend retorna 409)
- **Voltar**: Link para o board de origem
- **Colunas padrão**: "A Fazer", "Em Andamento", "Concluído" (criadas automaticamente ao criar board)

## Dependências Internas

- [[../../core/services/README]] — `ColumnService`

## Dependências Externas

- `@angular/forms` — ReactiveFormsModule, FormBuilder
- `@angular/router` — ActivatedRoute (para obter boardId)

## Rota

| Rota | Componente | Auth |
|---|---|---|
| `/columns?boardId=X` | `ColumnsManagerComponent` | JWT |

## Fluxos Importantes

### Reordenação
```
[↑] → ColumnService.reorder(columnId, column.Order - 1)
[↓] → ColumnService.reorder(columnId, column.Order + 1)
     → PATCH /columns/:id/order { order: novoValor }
     → backend troca ordens entre colunas
     → atualiza estado local
```

### Exclusão com proteção
```
[Excluir] → ColumnService.delete(id)
  → DELETE /columns/:id
  → se 409 (tem cards): exibe mensagem de erro
  → se 204: remove coluna da lista
```

## Observações Técnicas

- `boardId` é passado como query param, não como path param. Consistente com a API (`GET /columns?boardId=X`).
- A proteção contra exclusão de coluna com cards é feita no backend (retorna 409 Conflict com mensagem em pt-BR: "Remova os cards antes de excluir a coluna").
- Reordenação usa PATCH com troca direta de valores de `Order`. Não recalcula globalmente — apenas troca entre a coluna alvo e a origem.
