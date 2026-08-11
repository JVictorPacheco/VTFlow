---
tags:
  - frontend
  - core
  - interceptors
---

# Interceptors

## Objetivo do Módulo

Interceptar requisições HTTP para anexar token de autenticação e tratar respostas 401 (não autorizado).

## Funcionalidades

### `authInterceptor` (`auth.interceptor.ts`)

- Tipo: `HttpInterceptorFn` (interceptor funcional)
- **Request**: Obtém token via `AuthService.getToken()` e anexa header `Authorization: Bearer <token>`
- **Response (erro)**: Se status for 401, chama `AuthService.logout()` (remove token e redireciona para `/login`)
- Registrado em `app.config.ts` via `withInterceptors([authInterceptor])`

## Dependências Internas

- [[../services/README]] — `AuthService.getToken()`, `AuthService.logout()`

## Dependências Externas

- `@angular/common/http` — `HttpInterceptorFn`, `HttpRequest`, `HttpHandlerFn`
- `rxjs` — `catchError`, `throwError`

## Módulos Relacionados

- [[../guards/README]] — Guard impede acesso inicial; interceptor trata expiração durante uso
- [[../services/README]] — `AuthService` fornece token e logout

## Pontos de Entrada

- `auth.interceptor.ts` — Único arquivo do módulo
- Registrado globalmente em `app.config.ts:14`

## Fluxo

```
[HttpClient] → [authInterceptor] → adiciona Authorization header → [Rede]
                                                                        ↓
[HttpClient] ← [authInterceptor] ← se 401, chama authService.logout() ←─┘
```

## Observações Técnicas

- Implementado como função (não classe), padrão Angular v14+.
- Logout no 401 é uma abordagem pragmática para MVP. Em produção, idealmente deve-se tentar refresh token antes do logout.
- Não há tratamento para outros erros HTTP (403, 500, etc.) — apenas 401 tem ação automática.
