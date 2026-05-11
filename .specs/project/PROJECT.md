# Todo Board

**Vision:** Aplicação web estilo Trello para organização pessoal de tarefas com cards, etiquetas coloridas e colunas customizáveis.
**For:** Uso pessoal — organização do dia a dia.
**Solves:** Falta de uma ferramenta própria e simples para gerenciar tarefas com visibilidade de prioridade, prazo e status em um board visual.

## Goals

- Ter um board funcional com CRUD completo de tarefas, etiquetas e colunas até o fim do v1.
- Servir como projeto de estudo prático de .NET 9 + Angular + SQLite com autenticação JWT.

## Tech Stack

**Backend:**
- Runtime: .NET 9 (ASP.NET Core Web API)
- Linguagem: C#
- Banco de dados: SQLite (via Entity Framework Core)
- Autenticação: JWT (Bearer Token)

**Frontend:**
- Framework: Angular (latest)
- Estilos: TailwindCSS
- Tema: Dark/Light mode com toggle

**Key dependencies:**
- `Microsoft.EntityFrameworkCore.Sqlite`
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `@angular/cdk` (drag and drop entre colunas)
- `TailwindCSS`

## Scope

**v1 inclui:**
- Autenticação: registro e login com JWT (usuário único)
- CRUD de Colunas: colunas padrão fixas + possibilidade de criar novas
- CRUD de Cards/Tarefas: título, descrição, prazo (opcional), prioridade, status, etiquetas
- CRUD de Etiquetas: nome + cor, reutilizáveis entre cards
- Board visual: cards organizados por coluna, com drag-and-drop entre colunas
- Tema dark/light com toggle

**Explicitamente fora do escopo:**
- Integração com IA
- Múltiplos usuários / multi-tenant
- OAuth (Google, GitHub, etc.)
- Notificações / e-mail
- Aplicativo mobile
- Compartilhamento de boards

## Constraints

- Timeline: sem prazo definido (projeto de estudo)
- Técnico: SQLite como banco (sem necessidade de servidor de banco)
- Recursos: desenvolvimento solo
