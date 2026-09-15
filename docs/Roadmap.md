---
tags:
  - roadmap
  - planejamento
  - milestones
created: 2026-08-10
---

# Roadmap

## Visão Geral

Roadmap organizado por milestones, do curto ao longo prazo, baseado na análise do código atual e nos riscos identificados na [[Arquitetura do Sistema]].

## Status Atual (12/08/2026)

- **Milestone 1 (Estabilização e Segurança)**: ✅ Concluído
  - Índice único em `Users.Username`, FKs `UserId → Users`, CORS Dev/Production, rate limiting `/auth/*`, JWT via UserSecrets
- **Milestone 2 (Qualidade e Testes)**: 🔄 Em andamento
  - ✅ P6–P8: 14 testes backend (xUnit) + 30 testes frontend (Vitest) + testes de integração (WebApplicationFactory)
  - ⬜ P9 (CI/CD) pendente
- **Milestone 3–6**: ⬜ Não iniciados

---

## Milestone 1: Estabilização e Segurança (Curto Prazo)

> **Objetivo**: Corrigir riscos técnicos críticos antes de evoluir funcionalidades.

| ID | Tarefa | Prioridade | Esforço |
|---|---|---|---|
| 1.1 | Mover chave JWT para User Secrets / variável de ambiente | **Crítica** | P |
| 1.2 | Adicionar `UserId` aos modelos `Board` e isolar queries por usuário (multi-tenancy) | **Crítica** | M |
| 1.3 | Adicionar `ExceptionHandlerMiddleware` global | Alta | P |
| 1.4 | Restringir CORS em produção para origens específicas | Alta | P |
| 1.5 | Adicionar logging estruturado com `ILogger<T>` nos controllers | Média | M |
| 1.6 | Adicionar rate limiting nos endpoints `/auth/*` | Média | P |

---

## Milestone 2: Qualidade de Código e Testes

> **Objetivo**: Aumentar cobertura de testes e melhorar separação de responsabilidades.

| ID | Tarefa | Prioridade | Esforço |
|---|---|---|---|
| 2.1 | Extrair lógica de negócio dos Controllers para Services (`BoardService`, `CardService`, etc.) | **Crítica** | G |
| 2.2 | Criar testes unitários para todos os Services do backend (xUnit/NUnit) | Alta | G |
| 2.3 | Criar testes de integração para endpoints da API | Alta | G |
| 2.4 | Criar testes unitários para Services e Components do frontend (Vitest) | Alta | G |
| 2.5 | Adicionar testes E2E (Cypress ou Playwright) | Média | G |
| 2.6 | Configurar cobertura de código mínima (ex: 80%) | Média | M |

---

## Milestone 3: Funcionalidades Avançadas

> **Objetivo**: Expandir as capacidades do produto.

| ID | Tarefa | Prioridade | Esforço |
|---|---|---|---|
| 3.1 | **Drag and drop entre boards**: Permitir mover cards entre boards diferentes | Média | M |
| 3.2 | **Filtros e busca de cards**: Busca textual e filtros por prioridade, etiqueta, data | Média | M |
| 3.3 | **Upload de anexos nos cards**: Imagens e arquivos vinculados aos cards | Baixa | G |
| 3.4 | **Notificações**: Alertas para cards com data de vencimento próxima | Baixa | M |
| 3.5 | **Histórico de alterações com diff**: Mostrar o que mudou (antes/depois) no log de atividades | Baixa | M |
| 3.6 | **Exportar/Importar board**: JSON ou CSV | Baixa | M |

---

## Milestone 4: Infraestrutura e DevOps

> **Objetivo**: Preparar o projeto para deploy e operação profissional.

| ID | Tarefa | Prioridade | Esforço |
|---|---|---|---|
| 4.1 | Migrar banco de dados de SQLite para PostgreSQL | Alta | M |
| 4.2 | Criar `Dockerfile` e `docker-compose.yml` para backend + frontend + banco | Alta | M |
| 4.3 | Configurar pipeline CI/CD (GitHub Actions) | Alta | M |
| 4.4 | Adicionar health checks robustos (DB, memória) | Média | P |
| 4.5 | Configurar HTTPS em produção com certificados | Média | M |
| 4.6 | Documentar API com OpenAPI/Swagger público | Média | P |

---

## Milestone 5: UX e Internacionalização

> **Objetivo**: Melhorar experiência do usuário e alcançar audiência global.

| ID | Tarefa | Prioridade | Esforço |
|---|---|---|---|
| 5.1 | Internacionalização (i18n): extrair strings para arquivos de tradução (pt-BR + en-US) | Média | G |
| 5.2 | Melhorar responsividade mobile (PWA) | Média | G |
| 5.3 | Adicionar atalhos de teclado (ex: `N` para novo card, `Esc` para fechar modais) | Baixa | M |
| 5.4 | Animações e transições (drag and drop mais fluido) | Baixa | M |
| 5.5 | Onboarding / tour guiado para novos usuários | Baixa | M |

---

## Milestone 6: Colaboração e Multi-Usuário

> **Objetivo**: Permitir que múltiplos usuários colaborem em boards compartilhados.

| ID | Tarefa | Prioridade | Esforço |
|---|---|---|---|
| 6.1 | **Compartilhamento de boards**: Convidar usuários para um board (owner/member) | Alta | G |
| 6.2 | **Permissões**: Role-based access (admin, editor, viewer) | Alta | G |
| 6.3 | **Comentários com menção**: `@username` para notificar usuários | Média | M |
| 6.4 | **Atribuição de cards**: Cada card pode ter um responsável (`AssigneeId`) | Média | M |
| 6.5 | **WebSockets / SignalR**: Atualizações em tempo real no board compartilhado | Baixa | GG |

---

## Estimativas de Esforço

| Tamanho | Descrição |
|---|---|
| **P** (Pequeno) | Até 4 horas |
| **M** (Médio) | 1 a 3 dias |
| **G** (Grande) | 3 a 10 dias |
| **GG** (Muito Grande) | 10+ dias |

---

## Diagrama de Dependências entre Milestones

```
M1 (Estabilização) ──► M2 (Qualidade/Testes) ──► M3 (Funcionalidades)
                           │
                           ▼
                      M4 (Infra/DevOps) ──► M5 (UX/i18n)
                           │
                           ▼
                      M6 (Colaboração)
```

> M6 depende de M1 (multi-tenancy é pré-requisito para colaboração).
> M5 pode ser feito em paralelo com M3.
