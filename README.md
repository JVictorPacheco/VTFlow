# VTFlow

> Kanban Board com Angular 21 + .NET 9 + SQLite

## Sobre

Gerenciador de tarefas estilo Kanban com colunas personalizáveis, cards, subtarefas, comentários, etiquetas e log de atividades. Interface em português (pt-BR) com tema dark/light.

## Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | Angular 21, Tailwind CSS 3, TypeScript 5.9 |
| **Backend** | .NET 9, ASP.NET Core Web API |
| **Banco** | SQLite (EF Core 9) |
| **Autenticação** | JWT Bearer + BCrypt |
| **Testes** | Vitest (frontend) |

## Estrutura

```
VTFlow/
├── backend/                  # API .NET 9
│   └── VTFlow.Api/
│       ├── Controllers/      # Endpoints REST
│       ├── Models/           # Entidades EF Core
│       ├── Services/         # AuthService (JWT + BCrypt)
│       ├── Data/             # AppDbContext
│       └── Migrations/       # EF Core Migrations
├── frontend/                 # SPA Angular 21
│   └── src/app/
│       ├── core/             # Services, Guards, Interceptors
│       └── features/         # Componentes de página
└── docs/                     # Documentação técnica
    ├── Objetivo do Sistema.md
    ├── Arquitetura do Sistema.md
    ├── Roadmap.md
    └── GitFlow.md
```

## Início Rápido

### Backend

```bash
cd backend/VTFlow.Api
dotnet restore
dotnet run
# API em http://localhost:5253
# Health check: http://localhost:5253/health
```

### Frontend

```bash
cd frontend
npm install
npm start
# App em http://localhost:4200
```

## Documentação

- [[docs/Objetivo do Sistema]] — Propósito, fluxos de negócio e atores
- [[docs/Arquitetura do Sistema]] — Padrões, riscos e diretrizes técnicas
- [[docs/Roadmap]] — Planejamento de milestones e funcionalidades futuras
- [[docs/GitFlow]] — Estratégia de branching e convenções de commit

## Spec Driven Development

Este projeto segue o modelo **Spec Driven Development**. As especificações ficam na pasta `.specs/` (gitignored, usada como guia de desenvolvimento). Consulte [[docs/Arquitetura do Sistema]] para entender as regras arquiteturais que governam as implementações.

## GitFlow

O projeto segue GitFlow. Ver [[docs/GitFlow]] para a estratégia de branches, convenções de commit e fluxo de PRs.

## Licença

Proprietário.
