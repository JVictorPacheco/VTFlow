---
tags:
  - arquitetura
  - backend
  - frontend
  - design
created: 2026-08-10
---

# Arquitetura do Sistema

## Visão Arquitetural

O ToDo-Board segue uma arquitetura **SPA + API RESTful** clássica de dois tiers:

```
┌──────────────────────────┐     HTTP/JSON      ┌──────────────────────────┐
│     Frontend (Angular)   │ ◄──────────────► │    Backend (.NET 9)      │
│     Porta 4200           │    JWT Bearer     │    Porta 5253/7135       │
├──────────────────────────┤                    ├──────────────────────────┤
│  Features (pages)        │                    │  Controllers (REST)      │
│  Core Services (HTTP)    │                    │  Services (lógica)       │
│  Guards + Interceptors   │                    │  Models (EF Core)        │
│  Signals (state)         │                    │  DbContext (SQLite)      │
└──────────────────────────┘                    └──────────┬───────────────┘
                                                           │
                                                    ┌──────▼──────┐
                                                    │   SQLite    │
                                                    │ todo-board  │
                                                    │    .db      │
                                                    └─────────────┘
```

## Padrões Utilizados

| Padrão | Onde | Como |
|---|---|---|
| **RESTful API** | Backend (Controllers) | Verbos HTTP + recursos nomeados + JSON |
| **Repository Pattern (via EF Core)** | Backend (AppDbContext) | DbContext atua como Unit of Work, DbSet como repositório |
| **JWT Authentication** | Backend (AuthService + Program.cs) | Token Bearer com claims de usuário, 8h de expiração |
| **Interceptor Pattern** | Frontend (auth.interceptor.ts) | Intercepta requisições HTTP para anexar token |
| **Guard Pattern** | Frontend (auth.guard.ts) | Protege rotas que exigem autenticação |
| **Service Layer** | Frontend (core/services/*) | Serviços injetáveis com `providedIn: 'root'` |
| **Signals (Reactive State)** | Frontend (componentes) | `signal()` e `computed()` para estado local |
| **Lazy Loading** | Frontend (app.routes.ts) | `loadComponent` com `import()` para code-splitting |
| **Active Record (via EF Core)** | Backend (Models) | Entidades simples com propriedades de navegação |
| **Convention over Configuration** | Backend (ASP.NET Core) | Roteamento por atributo, DI automática, convenções EF Core |

## Regras Arquiteturais

1. **Separação Backend/Frontend**: Comunicação exclusivamente via HTTP/JSON. Nenhum acoplamento direto.
2. **Autenticação obrigatória**: Todas as rotas (exceto `/auth/*`, `/health` e telas de login/registro) exigem token JWT.
3. **API como fonte da verdade**: Toda lógica de negócio reside no backend. O frontend é apenas apresentação.
4. **CORS permissivo em dev**: Política `AllowAll` apenas em ambiente de desenvolvimento.
5. **Migrations automáticas**: Banco versionado via EF Core Migrations (10 migrações registradas).
6. **Idempotência parcial**: Operações de update/delete retornam 404 se recurso não existe. Create retorna 409 em conflitos de nome.
7. **Log automático de atividades**: Toda mutação em cards gera registro em `CardActivities`.
8. **Validação no servidor**: Backend valida todos os inputs (nunca confia no frontend).

## Convenções Técnicas

### Backend
- **Namespace**: `TodoBoard.Api.{Camada}` (Controllers, Models, Services, Data)
- **Registros de Request/Response**: `record` types no topo de cada controller
- **Rotas**: `[Route("recurso")]` no controller, verbos HTTP explícitos nos métodos
- **Status Codes**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict
- **Formato de erro**: `{ "error": "mensagem" }`
- **Primary constructors**: Injeção de dependência via parâmetros no construtor da classe
- **JSON**: `JsonStringEnumConverter` para serializar enums como string

### Frontend
- **Standalone Components**: Sem NgModules, tudo standalone
- **Inline Templates**: Templates HTML no próprio arquivo `.ts` (não há arquivos `.html` separados)
- **Signals**: `signal()` para estado mutável, sem RxJS Subjects
- **Formulários**: `ReactiveFormsModule` com `FormBuilder`
- **Injeção**: `inject()` (não construtor) em componentes e serviços
- **Tailwind CSS**: Classes utilitárias com dark mode via classe `dark`
- **Serviços**: `@Injectable({ providedIn: 'root' })`, interface exportada junto ao serviço
- **Rotas**: Lazy loading com `loadComponent` e `canActivate: [authGuard]`

## Separação de Responsabilidades

### Backend

| Camada | Responsabilidade | Pasta |
|---|---|---|
| **Controllers** | Receber requisições HTTP, validar inputs, chamar DbContext, retornar respostas | `Controllers/` |
| **Services** | Lógica de negócio complexa (autenticação: BCrypt + JWT) | `Services/` |
| **Models** | Definição de entidades e enums do domínio | `Models/` |
| **Data** | Configuração do EF Core (DbContext, relacionamentos) | `Data/` |
| **Migrations** | Versionamento do schema do banco | `Migrations/` |

> **Observação**: A lógica de negócio dos recursos (Boards, Cards, etc.) está **embutida nos Controllers**, não em Services dedicados. Apenas `AuthService` existe como service separado. Isso é aceitável para o estágio MVP, mas para crescimento futuro recomenda-se extrair serviços de domínio.

### Frontend

| Camada | Responsabilidade | Pasta |
|---|---|---|
| **Core/Services** | Comunicação HTTP com a API | `core/services/` |
| **Core/Guards** | Proteção de rotas (auth) | `core/guards/` |
| **Core/Interceptors** | Interceptação HTTP (anexar token, tratar 401) | `core/interceptors/` |
| **Features** | Componentes de página com UI e estado local | `features/` |

## Fluxo de Comunicação entre Módulos

### Frontend → Backend

```
[Component] → [Service] → [HttpClient] → [AuthInterceptor] → [Rede] → [Backend Controller] → [DbContext] → [SQLite]
```

1. Componente usa `inject(MeuService)` e chama método (ex: `boardService.getAll()`)
2. Service retorna `Observable<T>` do `HttpClient`
3. `authInterceptor` anexa header `Authorization: Bearer <token>` automaticamente
4. Controller recebe, autentica via JWT middleware, processa com DbContext
5. Resposta JSON retorna ao componente via Observable

### Frontend Interno

```
[AuthService] ←→ [localStorage]  (token, tema)
[ThemeService] ←→ [localStorage] (dark/light) ←→ [document.documentElement.classList]
[AuthGuard] → [AuthService.isAuthenticated()] → [localStorage]
```

### Backend Interno

```
[Program.cs] → [AuthMiddleware] → [Controller] → [DbContext] → [SQLite]
                    ↑                                    ↓
              [AuthService] ←── [JWT Config]    [EF Core Migrations]
```

## Dependências Críticas

### Backend (.NET 9)

| Dependência | Versão | Propósito |
|---|---|---|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.4 | Autenticação JWT |
| `Microsoft.AspNetCore.OpenApi` | 9.0.7 | Geração de spec OpenAPI |
| `Microsoft.EntityFrameworkCore.Sqlite` | 9.0.7 | Provider EF Core para SQLite |
| `Microsoft.EntityFrameworkCore.Design` | 9.0.7 | Ferramentas de migração |
| `Microsoft.EntityFrameworkCore.Tools` | 9.0.7 | CLI do EF Core |
| `BCrypt.Net-Next` | 4.1.0 | Hash de senhas |

### Frontend (Angular 21)

| Dependência | Versão | Propósito |
|---|---|---|
| `@angular/core` | ^21.2.0 | Framework |
| `@angular/router` | ^21.2.0 | Roteamento SPA |
| `@angular/forms` | ^21.2.0 | Formulários reativos |
| `@angular/common` | ^21.2.0 | HttpClient, pipes |
| `tailwindcss` | ^3.4.19 | Framework CSS utilitário |
| `@tailwindcss/forms` | ^0.5.11 | Reset de estilos de formulário |
| `vitest` | ^4.0.8 | Test runner |
| `prettier` | ^3.8.1 | Formatação de código |

## Riscos Técnicos e Acoplamentos

### Risco 1: Chave JWT hardcoded
**Arquivo**: `appsettings.json:11`
**Descrição**: A chave secreta JWT (`"TodoBoardSuperSecretKey2024!@#$%^&*()"`) está em texto plano no arquivo de configuração versionado.
**Impacto**: Qualquer pessoa com acesso ao repositório pode gerar tokens JWT válidos.
**Recomendação**: Usar variáveis de ambiente ou User Secrets para a chave JWT.

### Risco 2: Banco de dados multi-tenant inexistente
**Descrição**: Boards e Cards não têm relação com `User`. Todos os usuários autenticados veem e manipulam os mesmos dados.
**Impacto**: Impossibilita uso multi-usuário real. Um usuário pode ver/excluir dados de outro.
**Recomendação**: Adicionar `UserId` (FK) nos modelos `Board` e isolar queries por usuário autenticado.

### Risco 3: Lógica de negócio nos Controllers
**Descrição**: Regras de validação, criação de colunas padrão e log de atividades estão nos Controllers, não em Services dedicados.
**Impacto**: Dificulta testes unitários e reuso de lógica. Controllers crescerão com novas features.
**Recomendação**: Extrair para Services de domínio (ex: `BoardService`, `CardService`).

### Risco 4: SQLite em produção
**Descrição**: SQLite é um banco de arquivo local, não adequado para ambientes com múltiplas instâncias ou alta concorrência.
**Impacto**: Baixo em MVP. Bloqueia escalabilidade horizontal.
**Recomendação**: Migrar para PostgreSQL ou SQL Server antes de ir a produção.

### Risco 5: CORS AllowAll
**Descrição**: `AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()` em desenvolvimento.
**Impacto**: Baixo (apenas em dev). Deve ser restringido em produção.
**Recomendação**: Configurar origens específicas no ambiente de produção.

### Risco 6: Sem tratamento de erros global
**Descrição**: Não há middleware de exception handling (ex: `app.UseExceptionHandler()`).
**Impacto**: Exceções não tratadas retornarão HTML 500 ou stack trace.
**Recomendação**: Adicionar middleware de tratamento de exceções global.

### Acoplamento identificado: Card ↔ Subtasks + Comments + Labels + Activities
**Descrição**: O modelo `Card` importa 4 coleções de navegação. Updates no card exigem múltiplos `Include()`/`ThenInclude()`. Deleção de card não propaga cascade para todas as entidades filhas (apenas `CardLabels` é removido manualmente).
**Impacto**: Risco de dados órfãos se cascade não estiver bem configurado.
**Observação**: `CardLabels` é removido manualmente no delete do Card. Subtasks, Comments e Activities dependem de cascade configurado no EF Core.

## Diretrizes para Futuras Implementações

1. **Extrair lógica dos Controllers para Services**: Criar `BoardService`, `ColumnService`, `CardService`, `LabelService` no backend.
2. **Implementar multi-tenancy**: Adicionar `UserId` e filtrar queries.
3. **Adicionar testes**: Backend não tem testes. Frontend tem apenas 1 teste (`app.spec.ts`). Adicionar testes unitários e de integração.
4. **Migrar banco de dados**: Planejar migração de SQLite para PostgreSQL/SQL Server.
5. **Adicionar logging estruturado**: Usar `ILogger<T>` nos controllers e services.
6. **Configurar CI/CD**: Pipeline de build, teste e deploy.
7. **Adicionar paginação**: Endpoints `GET /cards` e `GET /boards` retornam todos os registros sem paginação.
8. **Internacionalização (i18n)**: Extrair strings hardcoded para arquivos de tradução.
9. **Tratamento de erros global**: Adicionar `ExceptionHandlerMiddleware`.
10. **Rate limiting**: Proteger endpoints de autenticação contra brute force.
11. **Migrar chave JWT para User Secrets / variável de ambiente**.
