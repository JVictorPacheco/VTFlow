---
tags:
  - frontend
  - core
---

# Core

## Objetivo do Módulo

Camada de infraestrutura do frontend: serviços HTTP, guards de rota, interceptors e serviços transversais (tema).

## Responsabilidade Principal

- Comunicação com a API backend via HttpClient
- Interceptação de requisições para anexar token JWT
- Proteção de rotas que exigem autenticação
- Gerenciamento de tema (dark/light)

## Estrutura

```
core/
├── guards/
│   └── auth.guard.ts              # Bloqueia rotas sem autenticação
├── interceptors/
│   └── auth.interceptor.ts        # Anexa token JWT, trata 401
└── services/
    ├── auth.service.ts            # Login, register, logout, token
    ├── board.service.ts           # CRUD de boards
    ├── card.service.ts            # CRUD de cards + move + reorder
    ├── column.service.ts          # CRUD de colunas + reorder
    ├── label.service.ts           # CRUD de labels
    ├── subtask.service.ts         # CRUD de subtasks + toggle + rename
    ├── comment.service.ts         # CRUD de comentários
    ├── activity.service.ts        # Leitura de log de atividades
    ├── health.service.ts          # Health check da API
    └── theme.service.ts           # Toggle dark/light mode
```

## Dependências Internas

- `environments/environment.ts` — URL base da API
- `@angular/router` — Guards e redirecionamentos
- `@angular/common/http` — HttpClient e interceptors

## Dependências Externas

- `@angular/core` — Injectable, signal, effect
- `rxjs` — Observables e operadores

## Módulos Relacionados

- [[../features/README]] — Consome os serviços deste módulo
- [[guards/README]] — Auth guard
- [[interceptors/README]] — Auth interceptor
- [[services/README]] — Todos os serviços HTTP

## Pontos de Entrada

- `auth.service.ts` — Autenticação (login, register, logout, isAuthenticated)
- `auth.interceptor.ts` — Intercepta automaticamente todas as requisições HTTP
- `auth.guard.ts` — Protege rotas com `canActivate: [authGuard]`

## Fluxos Importantes

### Autenticação
```
[LoginComponent] → authService.login() → POST /auth/login → guarda token no localStorage
                                                                      ↓
[AuthGuard] → authService.isAuthenticated() → verifica localStorage
[AuthInterceptor] → authService.getToken() → anexa header Authorization
```

### Tema
```
[ThemeService.isDark signal] → effect() → document.documentElement.classList.toggle('dark')
                                       → localStorage.setItem('theme', ...)
```

## Observações Técnicas

- Serviços são `@Injectable({ providedIn: 'root' })` — singleton global.
- `AuthService` gerencia token em `localStorage` (chave `auth_token`).
- `AuthInterceptor` faz logout automático ao receber HTTP 401.
- `ThemeService` usa `signal()` + `effect()` para reagir a mudanças de tema.
- `HealthService` tem fallback: retorna `"API indisponível"` em caso de erro de conexão.
