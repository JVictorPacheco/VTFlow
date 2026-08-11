---
tags:
  - frontend
  - core
  - services
---

# Core Services

## Objetivo do Módulo

Serviços Angular responsáveis pela comunicação HTTP com o backend, encapsulando chamadas de API e tipagem.

## Funcionalidades

| Serviço | Arquivo | Operações |
|---|---|---|
| `AuthService` | `auth.service.ts` | login, register, logout, isAuthenticated, getToken |
| `BoardService` | `board.service.ts` | getAll, getById, create, update, delete |
| `CardService` | `card.service.ts` | getAll, getByColumn, create, update, move, reorder, delete |
| `ColumnService` | `column.service.ts` | getAll, create, rename, reorder, delete |
| `LabelService` | `label.service.ts` | getAll, create, update, delete |
| `SubtaskService` | `subtask.service.ts` | getAll, create, toggle, rename, delete |
| `CommentService` | `comment.service.ts` | getAll, create, update, delete |
| `ActivityService` | `activity.service.ts` | getAll (read-only) |
| `HealthService` | `health.service.ts` | checkHealth (anônimo) |
| `ThemeService` | `theme.service.ts` | toggleTheme, isDark signal |

## Dependências Internas

- `environments/environment` — Define `apiUrl` base

## Dependências Externas

- `@angular/common/http` — `HttpClient`, `HttpParams`
- `@angular/core` — `Injectable`, `inject`, `signal`, `effect`

## Padrões

- **Base URL**: Todos os serviços usam `environment.apiUrl` como prefixo.
- **Tipagem**: Interfaces exportadas junto ao serviço (ex: `Board`, `BoardRequest`).
- **Retorno**: Todos os métodos retornam `Observable<T>`.
- **AuthService**: Único serviço que não apenas faz HTTP — também gerencia token no localStorage e navegação pós-login.

## Arquivos Críticos

- `auth.service.ts` — Gerencia ciclo de vida da autenticação
- `card.service.ts` — Serviço mais complexo (7 operações: CRUD + move + reorder)

## Observações Técnicas

- `CardService` importa interfaces de `SubtaskService` e `CommentService` (acoplamento circular leve via tipos).
- `ColumnService.getAll(boardId)` não usa `HttpParams` — passa `boardId` como query string manual na URL.
- Serviços não têm cache — toda requisição bate na API.
- `ThemeService` é o único serviço não-HTTP; é puramente frontend.
