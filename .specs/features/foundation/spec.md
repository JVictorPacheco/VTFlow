# Foundation — Specification

## Problem Statement

O projeto precisa de uma base sólida antes de qualquer feature de negócio. Isso inclui a estrutura dos projetos backend (.NET 9) e frontend (Angular), a conexão com o banco de dados SQLite via Entity Framework Core, e a configuração de ambiente de desenvolvimento com CORS e TailwindCSS.

## Goals

- [ ] Ter o backend rodando com EF Core + SQLite e migrations funcionando
- [ ] Ter o frontend Angular com TailwindCSS e dark/light mode configurados
- [ ] Backend e frontend se comunicando localmente (CORS resolvido)

## Out of Scope

| Feature | Razão |
|---|---|
| Autenticação JWT | Milestone 2 |
| Qualquer entidade de negócio (Card, Label, etc.) | Features posteriores |
| Deploy / produção | Fora do v1 |

---

## User Stories

### P1: Estrutura do Backend ⭐ MVP

**User Story**: Como desenvolvedor, quero um projeto .NET 9 Web API configurado com SQLite e EF Core, para que eu possa desenvolver os endpoints da aplicação.

**Why P1**: Sem isso, nenhuma feature de backend pode ser implementada.

**Acceptance Criteria**:

1. WHEN o projeto backend é iniciado THEN a API SHALL responder em `https://localhost:5001`
2. WHEN as migrations são executadas THEN o EF Core SHALL criar o arquivo `todo-board.db` corretamente
3. WHEN um endpoint de health check é chamado (`GET /health`) THEN a API SHALL retornar `200 OK`

**Independent Test**: Rodar `dotnet run` e acessar `GET /health` — deve retornar 200.

---

### P1: Estrutura do Frontend ⭐ MVP

**User Story**: Como desenvolvedor, quero um projeto Angular configurado com TailwindCSS e suporte a dark/light mode, para que eu possa construir a interface da aplicação.

**Why P1**: Sem isso, nenhuma feature de frontend pode ser implementada.

**Acceptance Criteria**:

1. WHEN o projeto frontend é iniciado THEN o Angular SHALL servir a aplicação em `http://localhost:4200`
2. WHEN TailwindCSS é instalado THEN classes utilitárias SHALL funcionar nos templates
3. WHEN o toggle de tema é acionado THEN a aplicação SHALL alternar entre dark e light mode

**Independent Test**: Rodar `ng serve`, ver a aplicação no browser com toggle de tema funcionando.

---

### P1: Comunicação Backend ↔ Frontend ⭐ MVP

**User Story**: Como desenvolvedor, quero que o frontend Angular consiga fazer chamadas HTTP ao backend .NET, para que as features possam ser integradas.

**Why P1**: Sem CORS configurado, nenhuma integração funciona em desenvolvimento.

**Acceptance Criteria**:

1. WHEN o frontend faz uma requisição ao backend em desenvolvimento THEN o backend SHALL responder sem erro de CORS
2. WHEN a URL base da API muda entre ambientes THEN o frontend SHALL usar variáveis de ambiente Angular para configurar a URL

**Independent Test**: Fazer uma chamada `GET /health` do Angular ao backend — sem erro de CORS no console.

---

## Edge Cases

- WHEN o arquivo `todo-board.db` não existe THEN o EF Core SHALL criá-lo automaticamente na primeira migration
- WHEN o backend não está rodando THEN o frontend SHALL exibir erro tratado (não travar silenciosamente)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| FOUND-01 | P1: Estrutura Backend | Design | Pending |
| FOUND-02 | P1: Migrations + SQLite | Design | Pending |
| FOUND-03 | P1: Health Check endpoint | Design | Pending |
| FOUND-04 | P1: Estrutura Frontend | Design | Pending |
| FOUND-05 | P1: TailwindCSS configurado | Design | Pending |
| FOUND-06 | P1: Dark/Light mode toggle | Design | Pending |
| FOUND-07 | P1: CORS configurado | Design | Pending |
| FOUND-08 | P1: Variáveis de ambiente Angular | Design | Pending |

---

## Success Criteria

- [ ] `dotnet run` sobe o backend sem erros
- [ ] `ng serve` sobe o frontend sem erros
- [ ] `GET /health` retorna 200 via browser e via Angular
- [ ] Toggle de tema funciona visualmente
- [ ] Banco SQLite é criado via `dotnet ef database update`
