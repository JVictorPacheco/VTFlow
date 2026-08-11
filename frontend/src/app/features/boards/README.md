---
tags:
  - frontend
  - features
  - boards
---

# Boards Feature

## Objetivo do Módulo

Tela de listagem e gerenciamento de boards. É a landing page após login.

## Funcionalidades

### `BoardListComponent` (`board-list.component.ts`)

- **Listagem**: Grid responsivo (1/2/3 colunas) de cards com nome, descrição e data
- **Criação**: Formulário expansível com nome (obrigatório) e descrição (opcional)
- **Edição inline**: Renomear board direto no card
- **Exclusão**: Modal de confirmação com mensagem de advertência sobre cascade delete
- **Estado vazio**: Mensagem e CTA quando não há boards
- **Header**: Toggle de tema, link para etiquetas, botão de logout
- **Navegação**: "Abrir" leva para `/boards/:id` (Kanban board)

## Dependências Internas

- [[../../core/services/README]] — `BoardService`, `ThemeService`
- [[../../core/services/README]] — `AuthService` (para logout)

## Dependências Externas

- `@angular/common` — `DatePipe` para formatação de data (`dd/MM/yyyy`)
- `@angular/forms` — ReactiveFormsModule, FormBuilder, Validators
- `@angular/router` — Router, RouterLink

## Rota

| Rota | Componente | Auth |
|---|---|---|
| `/boards` | `BoardListComponent` | JWT |

## Fluxos Importantes

### Criação de Board
```
[Novo Board] → formulário → BoardService.create({name, description})
  → POST /boards
  → backend cria Board + 3 colunas padrão
  → adiciona board à lista (prepend)
```

### Exclusão de Board
```
[Excluir] → modal de confirmação → BoardService.delete(id)
  → DELETE /boards/:id
  → remove board da lista local
```

## Observações Técnicas

- **Modal de confirmação**: Implementado manualmente com overlay `fixed inset-0 bg-black/50` + card centralizado. Não usa biblioteca de modal.
- **Edição inline**: Troca o card de visualização por um formulário quando `editingId === board.id`.
- **Cascade delete**: O backend remove Board + Columns (cascade configurado). Cards vinculados dependem do comportamento padrão do EF Core.
