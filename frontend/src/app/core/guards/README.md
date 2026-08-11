---
tags:
  - frontend
  - core
  - guards
---

# Guards

## Objetivo do Módulo

Proteger rotas que exigem autenticação, redirecionando usuários não autenticados para a tela de login.

## Funcionalidades

### `authGuard` (`auth.guard.ts`)

- Tipo: `CanActivateFn` (guard funcional)
- Verifica `AuthService.isAuthenticated()` → consulta `localStorage`
- Se autenticado: retorna `true` (permite acesso)
- Se não autenticado: retorna `UrlTree` para `/login`

## Dependências Internas

- [[../services/README]] — `AuthService.isAuthenticated()`

## Dependências Externas

- `@angular/router` — `CanActivateFn`, `Router`, `UrlTree`

## Módulos Relacionados

- [[../interceptors/README]] — Interceptor complementa o guard (trata 401 após acesso)

## Pontos de Entrada

- `auth.guard.ts` — Único arquivo do módulo
- Usado em `app.routes.ts` via `canActivate: [authGuard]`

## Rotas Protegidas

Todas as rotas exceto `/login` e `/register`:
- `/boards` — Lista de boards
- `/boards/:id` — Kanban board
- `/labels` — Gerenciamento de etiquetas
- `/columns` — Gerenciamento de colunas

## Observações Técnicas

- Guard **não valida expiração do token** — apenas verifica presença no localStorage.
- Se o token expirar, o `authInterceptor` captura o 401 e faz logout.
- Implementado como função (não classe), seguindo o padrão moderno do Angular (v14+).
