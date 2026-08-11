---
tags:
  - frontend
  - features
  - auth
---

# Auth Feature

## Objetivo do Módulo

Telas de autenticação (login e registro) — as únicas rotas públicas da aplicação.

## Funcionalidades

### `LoginComponent` (`login/login.component.ts`)
- Formulário com username + senha (mín. 6 caracteres)
- Validação reativa (required, minLength)
- Mensagem de erro: "Usuário ou senha incorretos"
- Estado de loading: botão mostra "Entrando..." durante requisição
- Link para tela de registro

### `RegisterComponent` (`register/register.component.ts`)
- Formulário com username + senha (mín. 6 caracteres)
- Validação reativa (required, minLength)
- Tratamento de erro 409: "Nome de usuário já em uso"
- Após registro bem-sucedido: navega para `/login`
- Link para tela de login

## Dependências Internas

- [[../../core/services/README]] — `AuthService.login()`, `AuthService.register()`

## Dependências Externas

- `@angular/forms` — ReactiveFormsModule, FormBuilder, Validators
- `@angular/router` — RouterLink

## Rotas

| Rota | Componente | Auth |
|---|---|---|
| `/login` | `LoginComponent` | Público |
| `/register` | `RegisterComponent` | Público |

## Fluxos Importantes

### Login
```
[Form submit] → authService.login(username, password)
  → POST /auth/login
  → sucesso: guarda token no localStorage, navega para /boards
  → erro: exibe mensagem de erro
```

### Registro
```
[Form submit] → authService.register(username, password)
  → POST /auth/register
  → sucesso: navega para /login
  → erro 409: "Nome de usuário já em uso"
  → outro erro: "Erro ao criar conta"
```

## Observações Técnicas

- Ambos componentes usam o mesmo padrão: FormBuilder, signals para loading/error, inline template com Tailwind.
- Design visual: card centralizado (max-w-sm), fundo `bg-gray-50 dark:bg-gray-900`.
