# Foundation — Tasks

**Design**: `.specs/features/foundation/design.md`
**Status**: Done

---

## Estratégia de Testes (Greenfield)

Projeto novo sem TESTING.md definido. Para a Milestone 1 (fundação), o foco é garantir que a infraestrutura sobe corretamente:

- **Gate "build"**: projeto compila sem erros
- **Gate "smoke"**: endpoints respondem / UI renderiza
- Testes unitários serão introduzidos a partir da Milestone 2 (autenticação)

---

## Execution Plan

### Phase 1 — Backend Base (Sequencial)
```
T1 → T2 → T3
```

### Phase 2 — Frontend Base (Sequencial, paralelo ao Phase 1 se desejar)
```
T4 → T5 → T6
```

### Phase 3 — Integração (Sequencial, após Phase 1 e Phase 2)
```
(T3 + T6) → T7
```

---

## Task Breakdown

### T1: Criar projeto .NET 9 Web API

**What**: Criar o projeto `TodoBoard.Api` com `dotnet new webapi`
**Where**: `backend/TodoBoard.Api/`
**Depends on**: Nenhuma
**Reuses**: N/A
**Requirement**: FOUND-01

**Done when**:
- [ ] Projeto criado com `dotnet new webapi -n TodoBoard.Api`
- [ ] `dotnet build` executa sem erros
- [ ] Arquivo `TodoBoard.Api.csproj` existe com target `net9.0`

**Verify**: `dotnet build` → saída `Build succeeded`
**Gate**: build

---

### T2: Instalar EF Core + SQLite e criar AppDbContext

**What**: Adicionar pacotes EF Core + SQLite, criar `AppDbContext` vazio e registrar no `Program.cs`
**Where**: `backend/TodoBoard.Api/Data/AppDbContext.cs` + `Program.cs`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: FOUND-02

**Done when**:
- [ ] Pacotes instalados: `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.EntityFrameworkCore.Tools`, `Microsoft.EntityFrameworkCore.Design`
- [ ] `AppDbContext.cs` criado herdando de `DbContext`
- [ ] Registrado em `Program.cs` com `UseSqlite` apontando para `todo-board.db`
- [ ] `dotnet build` executa sem erros
- [ ] `dotnet ef migrations add InitialCreate` cria pasta `Migrations/` com sucesso
- [ ] `dotnet ef database update` cria o arquivo `todo-board.db`

**Verify**: arquivo `todo-board.db` existe após `dotnet ef database update`
**Gate**: build + smoke manual

---

### T3: Criar endpoint GET /health e configurar CORS

**What**: Adicionar endpoint de health check e configurar política CORS para desenvolvimento
**Where**: `backend/TodoBoard.Api/Program.cs`
**Depends on**: T2
**Reuses**: N/A
**Requirement**: FOUND-03, FOUND-07

**Done when**:
- [ ] `GET /health` retorna `200 OK` com body `{ "status": "healthy" }`
- [ ] Política CORS `AllowAll` ativa apenas em ambiente `Development`
- [ ] `dotnet run` sobe sem erros em `https://localhost:5001`
- [ ] Chamada para `https://localhost:5001/health` via browser retorna 200

**Verify**: `curl https://localhost:5001/health` → `{"status":"healthy"}`
**Gate**: smoke manual

---

### T4: Criar projeto Angular com TailwindCSS

**What**: Criar app Angular e instalar + configurar TailwindCSS com `darkMode: 'class'`
**Where**: `frontend/`
**Depends on**: Nenhuma
**Reuses**: N/A
**Requirement**: FOUND-04, FOUND-05

**Done when**:
- [ ] Projeto criado com `ng new todo-board-app --routing --style=css`
- [ ] TailwindCSS instalado e configurado (`tailwind.config.js` com `darkMode: 'class'`)
- [ ] `styles.css` importa as diretivas `@tailwind base/components/utilities`
- [ ] `@tailwindcss/forms` instalado
- [ ] `ng build` executa sem erros
- [ ] Uma classe Tailwind de exemplo (ex: `bg-blue-500`) funciona num template

**Verify**: `ng build` → `Build complete`
**Gate**: build

---

### T5: Criar ThemeService e toggle dark/light mode

**What**: Criar `ThemeService` que alterna classe `dark` no `<html>` e persiste no `localStorage`
**Where**: `frontend/src/app/core/services/theme.service.ts`
**Depends on**: T4
**Reuses**: N/A
**Requirement**: FOUND-06

**Done when**:
- [ ] `ThemeService` criado com métodos `toggleTheme()` e signal/observable `isDark$`
- [ ] Ao chamar `toggleTheme()`, a classe `dark` é adicionada/removida do elemento `<html>`
- [ ] Preferência é salva no `localStorage` e restaurada ao recarregar a página
- [ ] `AppComponent` usa o `ThemeService` e exibe um botão de toggle no template
- [ ] `ng build` executa sem erros

**Verify**: Abrir `http://localhost:4200`, clicar no toggle → tema muda; recarregar → tema persiste
**Gate**: smoke manual

---

### T6: Configurar environments Angular com apiUrl

**What**: Configurar `environment.ts` e `environment.prod.ts` com a variável `apiUrl`
**Where**: `frontend/src/environments/`
**Depends on**: T4
**Reuses**: N/A
**Requirement**: FOUND-08

**Done when**:
- [ ] `environment.ts` contém `apiUrl: 'https://localhost:5001'`
- [ ] `environment.prod.ts` contém `apiUrl: ''` (a preencher no deploy)
- [ ] `HttpClient` registrado no `app.config.ts` via `provideHttpClient()`
- [ ] `ng build` executa sem erros

**Verify**: `ng build` → sem erros; `environment.ts` tem `apiUrl` definido
**Gate**: build

---

### T7: Validar integração Frontend ↔ Backend (smoke test)

**What**: Criar um `HealthService` Angular que consome `GET /health` e exibir o resultado no `AppComponent`
**Where**: `frontend/src/app/core/services/health.service.ts` + `app.component.ts`
**Depends on**: T3, T6
**Reuses**: `environment.ts` (apiUrl), `HttpClient`
**Requirement**: FOUND-07, FOUND-08

**Done when**:
- [ ] `HealthService` com método `checkHealth(): Observable<{status: string}>` criado
- [ ] `AppComponent` chama `checkHealth()` no `ngOnInit` e exibe o status na tela
- [ ] Com backend rodando, a mensagem `healthy` aparece na UI sem erro de CORS no console
- [ ] Com backend parado, a UI exibe mensagem de erro tratado (ex: "API indisponível")

**Verify**:
1. Subir backend: `dotnet run`
2. Subir frontend: `ng serve`
3. Abrir `http://localhost:4200` → ver "healthy" na tela
4. Parar backend → ver mensagem de erro na UI
**Gate**: smoke manual

---

## Parallel Execution Map

```
Phase 1 (Backend — Sequencial):
  T1 → T2 → T3

Phase 2 (Frontend — Sequencial):
  T4 → T5
       T4 → T6   (T5 e T6 são independentes entre si, ambos dependem de T4)

Phase 3 (Integração — após T3 e T6):
  (T3 + T6) → T7
```

> T5 e T6 podem rodar em paralelo pois ambos dependem apenas de T4 e não compartilham estado.
> As fases 1 e 2 também podem rodar em paralelo entre si (backend e frontend são projetos independentes).

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Criar projeto .NET 9 | 1 comando + 1 arquivo de projeto | ✅ Granular |
| T2: EF Core + AppDbContext | 1 arquivo de contexto + configuração | ✅ Granular |
| T3: Health endpoint + CORS | 1 endpoint + 1 política no Program.cs | ✅ Granular |
| T4: Angular + TailwindCSS | 1 projeto + 1 config file | ✅ Granular |
| T5: ThemeService | 1 service + uso no AppComponent | ✅ Granular |
| T6: Environments + HttpClient | 2 arquivos de ambiente + 1 config | ✅ Granular |
| T7: Smoke test integração | 1 service + uso no AppComponent | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início da Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | Nenhuma | Início da Phase 2 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T4 | T4 → T6 | ✅ |
| T7 | T3, T6 | (T3 + T6) → T7 | ✅ |

---

## Requirement Traceability

| Requirement ID | Task | Status |
|---|---|---|
| FOUND-01 | T1 | Pending |
| FOUND-02 | T2 | Pending |
| FOUND-03 | T3 | Pending |
| FOUND-04 | T4 | Pending |
| FOUND-05 | T4 | Pending |
| FOUND-06 | T5 | Pending |
| FOUND-07 | T3, T7 | Pending |
| FOUND-08 | T6, T7 | Pending |
