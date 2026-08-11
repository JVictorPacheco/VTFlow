---
feature: milestone-1-seguranca
status: rascunho
created: 2026-08-11
---

# Milestone 1 — Estabilização e Segurança

## Motivação
O sistema atualmente tem três problemas críticos: (1) secrets versionados no código (chave JWT no appsettings.json), (2) nenhum isolamento de dados entre usuários (todos veem os mesmos boards), e (3) erros 500 retornando stack traces HTML. Esta milestone endereça esses problemas.

## Escopo
### Dentro
- RF01, RF02, RF03
### Fora
- Labels com ownership (permanecem globais)
- Autenticação de novos usuários / registro (auth existente não é alterado)
- Alterações no frontend

## Requisitos Funcionais

### RF01 - JWT via ambiente
**Como** desenvolvedor, **Quero** que a chave JWT seja lida de variável de ambiente/User Secrets, **Para** não expor secrets no código versionado.

Critérios:
- [ ] `appsettings.json` não contém mais a chave real (substituir por placeholder)
- [ ] Dev: lê de `UserSecrets` (dotnet user-secrets)
- [ ] Prod: lê de variável de ambiente `DOTNET_JWT_KEY`
- [ ] `JwtService` tenta UserSecrets → Environment → erro configurável se ausente

### RF02 - Multi-tenancy
**Como** usuário autenticado, **Quero** ver apenas meus próprios boards/columns/cards, **Para** que outros usuários não acessem meus dados.

Critérios:
- [ ] `Board` ganha campo `UserId` (int, FK → User)
- [ ] `Column` ganha campo `UserId` (int, FK → User)
- [ ] `Card` ganha campo `UserId` (int, FK → User)
- [ ] Todos os endpoints de Boards, Columns, Cards filtram pelo `UserId` do token JWT
- [ ] Ao criar Board/Column/Card, `UserId` é preenchido com o usuário logado
- [ ] Usuário A não vê boards/columns/cards do usuário B

### RF03 - ExceptionHandler
**Como** desenvolvedor, **Quero** um middleware global de tratamento de erros, **Para** que erros 500 retornem JSON padronizado em vez de stack trace HTML.

Critérios:
- [ ] Middleware registrado no pipeline (antes de `UseAuthentication`)
- [ ] Retorna `{ "error": "mensagem" }` com status 500 (ou código original)
- [ ] Em dev, inclui `details` com stack trace (via `IHostEnvironment`)
- [ ] Middleware captura apenas exceções não tratadas

## Regras de Negócio
- **RN01**: O `UserId` é extraído da claim `sub` do token JWT
- **RN02**: Entities existentes sem `UserId` (criadas antes da migração) ficam acessíveis a qualquer usuário autenticado (retrocompatibilidade via `WHERE UserId IS NULL OR UserId = @currentUserId`)
- **RN03**: Labels continuam globais (sem `UserId`) — intencional

## Modelo de Dados
| Mudança | Entidade | Campo |
|---|---|---|
| Adicionar | Board | UserId (int?, FK → User, nullable) |
| Adicionar | Column | UserId (int?, FK → User, nullable) |
| Adicionar | Card | UserId (int?, FK → User, nullable) |

**Migration:** Todos os campos `UserId` são **nullable** com default `NULL`, permitindo retrocompatibilidade.

## Riscos
- **Migration com dados existentes**: Campos nullable evitam necessidade de valor default — boards/columns/cards existentes ficam com `UserId = NULL` e acessíveis a todos (RN02)
- **Perfils deClaims**: Confirme que o `AuthService` grava o `sub` claim com o `User.Id` (int) — ajustar se gravar string
- **DTOs de resposta**: Precisam incluir `UserId` nas respostas de Board/Column/Card?
