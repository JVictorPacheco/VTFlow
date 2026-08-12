# AGENTS.md — VTFlow

## Stack
- Backend: .NET 9, ASP.NET Core Web API, EF Core 9, PostgreSQL (Supabase via Npgsql)
- Frontend: Angular 21, Tailwind CSS 3, TypeScript 5.9
- Auth: JWT Bearer + BCrypt (JwtService with UserSecrets → Env → dev-fallback)
- Database: Supabase PostgreSQL (connection pooler: aws-0-us-west-2.pooler.supabase.com:5432)

## Architectural Pattern
- **Vertical Slice Architecture** in `Features/` folder
- Each feature has its own folder with endpoint handlers, DTOs, and entities
- Minimal APIs via `MapPost`/`MapGet`/etc.
- Shared code in `Shared/` (DbContext, enums)

## Code Style
- C#: Records for DTOs, primary constructors, nullable enabled, implicit usings
- TypeScript: Standalone components, Signals for state, inline templates, `inject()` instead of constructor DI
- Tailwind dark mode via `class` strategy

## MCP Tools
- Use `context7` to search Microsoft .NET docs, ASP.NET Core docs, EF Core docs, and Vertical Slice Architecture references
- Use `gh_grep` to search GitHub for Vertical Slice implementation examples in C#/.NET

## Spec Driven Development
- Specs in `.specs/` (gitignored) guide implementation before code
- See `docs/` for architecture docs, roadmap, and GitFlow
- Template: `docs/Spec Template.md`

## Testing
- Backend: `dotnet test` em `backend/VTFlow.Api.Tests` (xUnit + WebApplicationFactory/InMemory)
- Frontend: `npx ng test --watch=false` em `frontend` (Vitest)
- Backend usa EF Core InMemory nos testes; `Migrate()` só roda quando `db.Database.IsRelational()`
- Ao rodar testes, o backend `dotnet run` deve estar parado (o .exe fica travado pelo processo)

## GitFlow
- `main` = production, `develop` = integration
- Features: `feature/<desc>`, Releases: `release/<ver>`, Hotfixes: `hotfix/<desc>`
- Commit convention: `type(scope): description` (feat, fix, refactor, test, docs, chore)
