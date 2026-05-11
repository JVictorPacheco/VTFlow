# Auth — Tasks

**Design**: `.specs/features/auth/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1 — Backend Base (Sequencial)
```
T1 → T2 → T3 → T4
```

### Phase 2 — Frontend Base (Sequencial, paralelo ao Phase 1)
```
T5 → T6 → T7
```

### Phase 3 — Frontend Features (T5 e T6 concluídos)
```
T6 concluído → T8 [P]
T7 concluído → T9 [P]
```

### Phase 4 — Integração (após T4 + T8 + T9)
```
(T4 + T8 + T9) → T10 → T11
```

---

## Task Breakdown

### T1: Adicionar entidade User e DbSet ao AppDbContext

**What**: Criar `Models/User.cs` e adicionar `DbSet<User>` ao `AppDbContext`, gerar migration
**Where**:
- `backend/TodoBoard.Api/Models/User.cs`
- `backend/TodoBoard.Api/Data/AppDbContext.cs`
**Depends on**: Nenhuma (fundação concluída)
**Requirement**: AUTH-01

**Done when**:
- [ ] `User.cs` criado com campos `Id`, `Username`, `PasswordHash`
- [ ] `DbSet<User> Users` adicionado ao `AppDbContext`
- [ ] `dotnet ef migrations add AddUserEntity` executa sem erros
- [ ] `dotnet ef database update` aplica migration sem erros
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(auth): add User entity and migration`

---

### T2: Instalar pacotes e criar AuthService backend

**What**: Instalar `BCrypt.Net-Next` e `Microsoft.AspNetCore.Authentication.JwtBearer`, criar `AuthService` com `RegisterAsync` e `LoginAsync`
**Where**: `backend/TodoBoard.Api/Services/AuthService.cs`
**Depends on**: T1
**Requirement**: AUTH-01, AUTH-02, AUTH-03, AUTH-04

**Done when**:
- [ ] Pacotes `BCrypt.Net-Next` e `Microsoft.AspNetCore.Authentication.JwtBearer` instalados
- [ ] `AuthService.cs` criado com `RegisterAsync(username, password)` — hash com BCrypt, salva no banco, retorna erro se username duplicado
- [ ] `LoginAsync(username, password)` — valida credenciais, gera JWT com expiração de 8h, retorna token ou null
- [ ] Chave JWT lida de `appsettings.json` → `Jwt:Key` e `Jwt:Issuer`
- [ ] `appsettings.json` atualizado com seção `Jwt`
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(auth): add AuthService with register and login logic`

---

### T3: Criar AuthController com endpoints register e login

**What**: Criar `AuthController` expondo `POST /auth/register` e `POST /auth/login`
**Where**: `backend/TodoBoard.Api/Controllers/AuthController.cs`
**Depends on**: T2
**Requirement**: AUTH-01, AUTH-02, AUTH-03

**Done when**:
- [ ] `AuthController` criado com rota base `[Route("auth")]`
- [ ] `POST /auth/register` → chama `AuthService.RegisterAsync`, retorna `201` ou `400`/`409`
- [ ] `POST /auth/login` → chama `AuthService.LoginAsync`, retorna `200 { token }` ou `401`
- [ ] DTOs `RegisterRequest` e `LoginRequest` criados (records)
- [ ] `dotnet build` passa
- [ ] Teste manual: `POST /auth/register` via Swagger retorna `201`

**Gate**: build + smoke manual
**Commit**: `feat(auth): add AuthController with register and login endpoints`

---

### T4: Configurar JWT middleware e proteger rotas no backend

**What**: Registrar autenticação JWT no `Program.cs` e aplicar `[Authorize]` como padrão global
**Where**: `backend/TodoBoard.Api/Program.cs`
**Depends on**: T3
**Requirement**: AUTH-05, AUTH-06

**Done when**:
- [ ] `AddAuthentication().AddJwtBearer(...)` configurado no `Program.cs` com parâmetros da seção `Jwt`
- [ ] `app.UseAuthentication()` e `app.UseAuthorization()` adicionados ao pipeline
- [ ] Política global de autorização aplicada (todos os endpoints exigem auth por padrão)
- [ ] `/health` e `/auth/*` marcados como `[AllowAnonymous]`
- [ ] `GET /health` sem token → `200 OK`
- [ ] `POST /auth/login` sem token → `200 OK`
- [ ] Qualquer outro endpoint sem token → `401 Unauthorized`
- [ ] `dotnet build` passa

**Gate**: build + smoke manual
**Commit**: `feat(auth): configure JWT middleware and protect routes`

---

### T5: Criar AuthService Angular

**What**: Criar `AuthService` com `login()`, `register()`, `logout()`, `isAuthenticated()` e `getToken()`
**Where**: `frontend/src/app/core/services/auth.service.ts`
**Depends on**: Nenhuma (independente do backend para build)
**Requirement**: AUTH-07, AUTH-09, AUTH-12

**Done when**:
- [ ] `AuthService` criado com `inject(HttpClient)` e `inject(Router)`
- [ ] `login(username, password)` — POST `/auth/login`, salva token no `localStorage`, navega para `/board`
- [ ] `register(username, password)` — POST `/auth/register`, navega para `/login`
- [ ] `logout()` — remove token do `localStorage`, navega para `/login`
- [ ] `isAuthenticated()` — retorna `true` se token existe no `localStorage`
- [ ] `getToken()` — retorna token do `localStorage` ou `null`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(auth): add Angular AuthService`

---

### T6: Criar AuthGuard e AuthInterceptor

**What**: Criar guard funcional que redireciona para `/login` e interceptor que injeta Bearer token
**Where**:
- `frontend/src/app/core/guards/auth.guard.ts`
- `frontend/src/app/core/interceptors/auth.interceptor.ts`
**Depends on**: T5
**Requirement**: AUTH-08, AUTH-10

**Done when**:
- [ ] `auth.guard.ts` — `CanActivateFn` que verifica `AuthService.isAuthenticated()`, redireciona para `/login` se falso
- [ ] `auth.interceptor.ts` — `HttpInterceptorFn` que adiciona `Authorization: Bearer <token>` se autenticado; redireciona para `/login` em resposta `401`
- [ ] Ambos registrados em `app.config.ts` (`withInterceptors([authInterceptor])`)
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(auth): add AuthGuard and AuthInterceptor`

---

### T7: Configurar rotas Angular (login, register, board)

**What**: Definir rotas `/login`, `/register` e `/board` (placeholder) com guard aplicado
**Where**: `frontend/src/app/app.routes.ts`
**Depends on**: T5
**Requirement**: AUTH-07, AUTH-08

**Done when**:
- [ ] Rota `/login` → `LoginComponent` (standalone, criado como placeholder mínimo)
- [ ] Rota `/register` → `RegisterComponent` (standalone, criado como placeholder mínimo)
- [ ] Rota `/board` → `BoardComponent` (standalone, placeholder) protegida por `authGuard`
- [ ] Rota `''` redireciona para `/board`
- [ ] Rota `**` redireciona para `/board`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(auth): configure app routes with auth guard`

---

### T8: Criar LoginComponent com formulário reativo

**What**: Implementar tela de login com Reactive Forms, validação e chamada ao `AuthService`
**Where**: `frontend/src/app/features/auth/login/login.component.ts` + `.html`
**Depends on**: T6, T7
**Requirement**: AUTH-07

**Done when**:
- [ ] Formulário reativo com campos `username` (required) e `password` (required, minLength 6)
- [ ] Submit chama `AuthService.login()` — em sucesso redireciona para `/board`
- [ ] Erro de login exibe mensagem "Usuário ou senha incorretos"
- [ ] Campos inválidos exibem mensagem de validação
- [ ] Link para `/register` presente
- [ ] Estilizado com TailwindCSS (dark/light mode compatível)
- [ ] `ng build` passa

**Gate**: build + smoke manual
**Commit**: `feat(auth): implement LoginComponent`

---

### T9: Criar RegisterComponent com formulário reativo

**What**: Implementar tela de registro com Reactive Forms, validação e chamada ao `AuthService`
**Where**: `frontend/src/app/features/auth/register/register.component.ts` + `.html`
**Depends on**: T6, T7
**Requirement**: AUTH-11

**Done when**:
- [ ] Formulário reativo com campos `username` (required) e `password` (required, minLength 6)
- [ ] Submit chama `AuthService.register()` — em sucesso redireciona para `/login`
- [ ] Erro de registro exibe mensagem apropriada (ex: "Nome de usuário já em uso")
- [ ] Link para `/login` presente
- [ ] Estilizado com TailwindCSS (dark/light mode compatível)
- [ ] `ng build` passa

**Gate**: build + smoke manual
**Commit**: `feat(auth): implement RegisterComponent`

---

### T10: Adicionar botão de logout ao AppComponent

**What**: Adicionar botão de logout no `AppComponent` visível apenas quando autenticado
**Where**: `frontend/src/app/app.ts` + `app.html`
**Depends on**: T8, T9
**Reuses**: `ThemeService` já existente no `AppComponent`
**Requirement**: AUTH-12

**Done when**:
- [ ] Botão "Sair" visível apenas quando `AuthService.isAuthenticated()` é `true`
- [ ] Clique chama `AuthService.logout()` → remove token → redireciona para `/login`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(auth): add logout button to AppComponent`

---

### T11: Smoke test de integração auth completo

**What**: Validar o fluxo completo de autenticação end-to-end (registro → login → acesso protegido → logout)
**Where**: Teste manual com backend + frontend rodando
**Depends on**: T4, T10
**Requirement**: todos AUTH-*

**Done when**:
- [ ] Acessar `http://localhost:4200` → redireciona para `/login`
- [ ] Acessar `/register` → preencher formulário → registro com sucesso → redireciona para `/login`
- [ ] Fazer login com credenciais registradas → redireciona para `/board`
- [ ] Inspecionar Network tab → requisições com header `Authorization: Bearer ...`
- [ ] Clicar em logout → redireciona para `/login` → token removido do localStorage
- [ ] Tentar acessar `/board` sem token → redireciona para `/login`

**Gate**: smoke manual end-to-end
**Commit**: N/A (task de validação, sem código novo)

---

## Parallel Execution Map

```
Phase 1 (Backend — Sequencial):
  T1 → T2 → T3 → T4

Phase 2 (Frontend Base — Sequencial, paralelo ao Phase 1):
  T5 → T6
  T5 → T7   (T6 e T7 independentes entre si, ambos dependem de T5)

Phase 3 (Frontend Features — após T6 e T7):
  T6 + T7 → T8 [P]
  T6 + T7 → T9 [P]   (T8 e T9 paralelos entre si)

Phase 4 (Integração — após T4 + T8 + T9):
  (T4 + T8 + T9) → T10 → T11
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: User entity + migration | 1 model + 1 DbSet + migration | ✅ Granular |
| T2: AuthService backend | 1 service com 2 métodos | ✅ Granular |
| T3: AuthController | 1 controller com 2 endpoints | ✅ Granular |
| T4: JWT middleware | 1 configuração no Program.cs | ✅ Granular |
| T5: AuthService Angular | 1 service com 5 métodos | ✅ Granular |
| T6: AuthGuard + Interceptor | 2 arquivos coesos (ambos infraestrutura de auth) | ✅ OK |
| T7: Rotas Angular | 1 arquivo de rotas + 3 placeholders | ✅ Granular |
| T8: LoginComponent | 1 componente + 1 template | ✅ Granular |
| T9: RegisterComponent | 1 componente + 1 template | ✅ Granular |
| T10: Logout no AppComponent | 1 modificação pontual | ✅ Granular |
| T11: Smoke test e2e | Validação manual | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | Nenhuma | Início Phase 2 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | T5 | T5 → T7 | ✅ |
| T8 | T6, T7 | T6 + T7 → T8 [P] | ✅ |
| T9 | T6, T7 | T6 + T7 → T9 [P] | ✅ |
| T10 | T8, T9 | T8 + T9 → T10 | ✅ |
| T11 | T4, T10 | T4 + T10 → T11 | ✅ |

---

## Requirement Traceability

| Requirement ID | Task | Status |
|---|---|---|
| AUTH-01 | T1, T3 | Pending |
| AUTH-02 | T2, T3 | Pending |
| AUTH-03 | T2, T3 | Pending |
| AUTH-04 | T2 | Pending |
| AUTH-05 | T4 | Pending |
| AUTH-06 | T4 | Pending |
| AUTH-07 | T7, T8 | Pending |
| AUTH-08 | T6, T7 | Pending |
| AUTH-09 | T5 | Pending |
| AUTH-10 | T6 | Pending |
| AUTH-11 | T9 | Pending |
| AUTH-12 | T5, T10 | Pending |
