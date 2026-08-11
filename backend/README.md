---
tags:
  - backend
  - módulo
---

# Backend

## Objetivo do Módulo

API RESTful que serve como fonte da verdade para toda a lógica de negócio, persistência e autenticação do ToDo-Board.

## Responsabilidade Principal

- Autenticação de usuários (JWT + BCrypt)
- CRUD completo de Boards, Columns, Cards, Labels, Subtasks, Comments
- Log automático de atividades em Cards
- Validação de regras de negócio
- Persistência em SQLite via Entity Framework Core

## Estrutura Interna

```
backend/
└── TodoBoard.Api/
    ├── Program.cs              # Entry point, DI, middleware pipeline
    ├── TodoBoard.Api.csproj    # Dependências NuGet
    ├── appsettings.json        # Connection string, JWT config
    ├── Controllers/            # Endpoints REST (8 controllers)
    ├── Models/                 # Entidades de domínio (10 models + 1 enum)
    ├── Services/               # AuthService
    ├── Data/                   # AppDbContext
    ├── Migrations/             # Versionamento do schema (10 migrações)
    └── Properties/             # Launch settings
```

## Dependências Externas

| Pacote | Versão |
|---|---|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.4 |
| `Microsoft.AspNetCore.OpenApi` | 9.0.7 |
| `Microsoft.EntityFrameworkCore.Sqlite` | 9.0.7 |
| `BCrypt.Net-Next` | 4.1.0 |

## Módulos Relacionados

- [[frontend/README]] — Consome esta API via HTTP
- [[../docs/Arquitetura do Sistema]] — Arquitetura completa
- [[../docs/Objetivo do Sistema]] — Visão de produto

## Pontos de Entrada

- `Program.cs` — Configuração e bootstrap da aplicação
- `GET /health` — Health check anônimo
- `POST /auth/register` — Registro
- `POST /auth/login` — Login (retorna JWT)

## Observações Técnicas

- Lógica de negócio está **nos Controllers**, não em Services dedicados (exceto AuthService). Refatoração recomendada.
- Não há relação `User → Board`. Todos os usuários compartilham os mesmos dados.
- Chave JWT está hardcoded em `appsettings.json`. Deve ser migrada para variável de ambiente.
- Não há testes automatizados no backend.

## Débitos Técnicos

1. Extrair lógica dos Controllers para Services de domínio
2. Implementar multi-tenancy (UserId nos Boards)
3. Adicionar testes unitários e de integração
4. Migrar chave JWT para User Secrets
5. Adicionar middleware de tratamento de exceções global
