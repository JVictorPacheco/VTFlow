---
tags:
  - bugs
  - pendencias
  - testes
created: 2026-08-12
updated: 2026-08-12
---

# Pendências e Bugs

Documento gerado após bateria de testes na API e revisão de código. Status: 12/08/2026.

---

## Bugs Corrigidos

| # | Bug | Causa | Correção |
|---|---|---|---|
| 1 | Card não aparecia após criação | `store.updateCard()` só atualiza cards existentes; card novo não era adicionado ao store | `onSaved()` agora usa `addCard()` para cards novos |
| 2 | Drag-and-drop entre colunas quebrado | `connectedLists()` gerava IDs que não batiam com os IDs reais dos `cdkDropList` | Substituído por `cdkDropListGroup` que conecta automaticamente |
| 3 | cdkDrag bloqueava clique nos cards | `cdkDrag` no elemento inteiro do card interceptava o `(click)` | Adicionado `[cdkDragStartDelay]="200"` — clique rápido abre detalhe, segurar + arrastar move |
| 4 | Erro 500 ao criar card com DueDate | Npgsql 9 rejeita `DateTimeKind.Unspecified` em colunas `timestamp with time zone` | `EnableLegacyTimestampBehavior` + `DateTime.SpecifyKind(..., Utc)` no DueDate |
| 5 | PendingModelChangesWarning bloqueava startup | Model snapshot desatualizado após mudanças | Suprimido o warning no `AppDbContext.OnConfiguring()` |
| 6 | Select "Mover para..." estourava layout | Sem `max-w-` no select, nomes longos quebravam o layout | Adicionado `max-w-[150px]` |

---

## Pendências Identificadas

### Segurança e Infra (Milestone 1)

| # | Pendência | Prioridade | Esforço |
|---|---|---|---|
| P1 | `Users.Username` sem índice único — permite duplicatas | Crítica | P |
| P2 | `UserId` em Boards/Columns/Cards sem FK para Users | Alta | P |
| P3 | CORS `AllowAll` em produção — restringir para origens específicas | Alta | P |
| P4 | Rate limiting nos endpoints `/auth/*` — sem proteção contra brute force | Média | P |
| P5 | Chave JWT no `appsettings.json` como `CHANGE_ME` (resolvido via UserSecrets, mas fallback frágil) | Média | P |

### Qualidade de Código (Milestone 2)

| # | Pendência | Prioridade | Esforço |
|---|---|---|---|
| P6 | Zero testes no backend (xUnit/NUnit) | Crítica | G |
| P7 | Frontend: apenas 4 arquivos de teste (auth apenas) | Alta | G |
| P8 | Sem testes de integração ou E2E | Alta | G |
| P9 | Sem CI/CD (GitHub Actions) | Média | M |

### Funcionalidades (Milestone 3)

| # | Pendência | Prioridade | Esforço |
|---|---|---|---|
| P10 | Drag-and-drop não atualiza ordem local após move (depende do refresh do server) | Média | P |
| P11 | Filtros e busca não testados na UI — verificar se funcionam corretamente | Média | M |
| P12 | `SubtaskDto` vs `SubtaskResponse` — duplicação de tipos, unificar | Baixa | P |
| P13 | Comentários não vêm no `GetCards` (só no `GetComments`), forçando fetch extra | Baixa | M |

### UX (Milestone 5)

| # | Pendência | Prioridade | Esforço |
|---|---|---|---|
| P14 | Modal de detalhe do card: overflow de conteúdo sem scroll adequado | Média | P |
| P15 | "Mover para..." dropdown no detalhe: sem feedback visual de sucesso após mover | Baixa | P |
| P16 | Sem indicador de carregamento ao criar/editar card (só texto "Salvando...") | Baixa | P |

---

## Resultado dos Testes de API

| Endpoint | Método | Status |
|---|---|---|
| `/health` | GET | ✅ |
| `/auth/register` | POST | ✅ |
| `/auth/login` | POST | ✅ |
| `/boards` | GET/POST | ✅ |
| `/boards/{id}` | GET/PUT/DELETE | ✅ |
| `/columns?boardId=` | GET/POST | ✅ |
| `/columns/{id}` | PUT/DELETE | ✅ (409 ao deletar com cards) |
| `/columns/{id}/order` | PATCH | ✅ |
| `/cards` | GET/POST | ✅ |
| `/cards/{id}` | PUT/DELETE | ✅ |
| `/cards/{id}/column` | PATCH | ✅ |
| `/cards/{id}/order` | PATCH | ✅ |
| `/cards/{id}/subtasks` | GET/POST | ✅ |
| `/cards/{id}/subtasks/{id}/toggle` | PATCH | ✅ |
| `/cards/{id}/subtasks/{id}/rename` | PATCH | ✅ |
| `/cards/{id}/subtasks/{id}` | DELETE | ✅ |
| `/cards/{id}/comments` | GET/POST | ✅ |
| `/cards/{id}/comments/{id}` | PUT/DELETE | ✅ |
| `/cards/{id}/activities` | GET | ✅ |
| `/labels` | GET/POST | ✅ |
| `/labels/{id}` | PUT/DELETE | ✅ |
