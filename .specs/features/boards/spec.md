# Boards — Specification

## Problem Statement

Atualmente o app tem um único board implícito — colunas e cards existem sem pertencer a nenhuma entidade `Board`. Para suportar múltiplos boards, é necessário introduzir a entidade `Board`, vincular colunas a ela e fornecer ao usuário uma tela para selecionar ou criar boards antes de acessar o board visual.

## Goals

- [ ] Usuário consegue criar, listar, renomear e excluir boards
- [ ] Colunas pertencem a um board (campo `boardId`)
- [ ] Ao entrar no app, o usuário vê a lista de seus boards e escolhe um para abrir
- [ ] Cada board tem seu próprio conjunto de colunas (e, indiretamente, cards)

## Out of Scope

| Feature | Razão |
|---|---|
| Compartilhamento de boards com outros usuários | Milestone 20 (colaboração multi-usuário) |
| Boards públicos / links de convite | Fora do escopo v1-v3 |
| Duplicar board | Sem demanda definida |
| Reordenar boards | Fora desta milestone |
| Arquivar board | Milestone 14 trata arquivamento de cards; boards seguem lógica diferente |
| Etiquetas por board (isolamento) | Etiquetas permanecem globais nesta milestone |

---

## User Stories

### P1: Criar board ⭐ MVP

**User Story**: Como usuário, quero criar um novo board com nome e descrição opcional, para que eu possa organizar conjuntos diferentes de tarefas separadamente.

**Why P1**: Pré-requisito de tudo — sem criar board não há como usar o sistema.

**Acceptance Criteria**:

1. WHEN `POST /boards` é chamado com `name` válido THEN a API SHALL criar o board e retornar `201` com o objeto criado
2. WHEN `POST /boards` é chamado sem `name` THEN a API SHALL retornar `400 Bad Request`
3. WHEN `POST /boards` é chamado com `name` duplicado THEN a API SHALL retornar `409 Conflict`
4. WHEN um board é criado THEN a API SHALL criar automaticamente as 3 colunas padrão ("A Fazer", "Em Andamento", "Concluído") vinculadas ao novo board
5. WHEN o usuário preenche o formulário e submete THEN o Angular SHALL navegar para o board recém-criado

**Independent Test**: Criar board via UI → redireciona para board com 3 colunas padrão.

---

### P1: Listar boards ⭐ MVP

**User Story**: Como usuário, quero ver todos os meus boards na tela inicial, para que eu possa escolher qual abrir.

**Why P1**: Ponto de entrada do app após o login.

**Acceptance Criteria**:

1. WHEN `GET /boards` é chamado THEN a API SHALL retornar `200 OK` com array de boards ordenado por `createdAt` decrescente
2. WHEN o usuário faz login THEN o Angular SHALL exibir a tela de boards (board list) como página inicial
3. WHEN não há boards THEN a UI SHALL exibir mensagem "Nenhum board criado ainda" com botão de criar

**Independent Test**: `GET /boards` retorna lista de boards do usuário.

---

### P1: Abrir board ⭐ MVP

**User Story**: Como usuário, quero clicar em um board da lista e acessar o board visual com suas colunas e cards.

**Why P1**: Fluxo central de navegação.

**Acceptance Criteria**:

1. WHEN `GET /boards/{id}` é chamado THEN a API SHALL retornar `200 OK` com os dados do board
2. WHEN o usuário clica em um board na lista THEN o Angular SHALL navegar para `/boards/{id}` e carregar colunas e cards do board selecionado
3. WHEN o board não existe THEN a API SHALL retornar `404` e o Angular SHALL exibir mensagem de erro

**Independent Test**: Clicar em board na lista → board visual abre com as colunas corretas.

---

### P1: Renomear board ⭐ MVP

**User Story**: Como usuário, quero renomear um board existente, para que eu possa ajustar o nome conforme o projeto evolui.

**Why P1**: Gerenciamento básico.

**Acceptance Criteria**:

1. WHEN `PUT /boards/{id}` é chamado com `name` válido THEN a API SHALL atualizar e retornar `200`
2. WHEN `PUT /boards/{id}` é chamado com id inexistente THEN a API SHALL retornar `404`
3. WHEN o usuário renomeia e salva THEN o Angular SHALL atualizar o nome sem reload

**Independent Test**: Renomear board via UI → nome atualizado na lista e no header do board.

---

### P1: Excluir board ⭐ MVP

**User Story**: Como usuário, quero excluir um board que não uso mais, com todos os seus dados.

**Why P1**: Gerenciamento básico.

**Acceptance Criteria**:

1. WHEN `DELETE /boards/{id}` é chamado THEN a API SHALL excluir o board, suas colunas e todos os cards (cascade) e retornar `204`
2. WHEN `DELETE /boards/{id}` é chamado com id inexistente THEN a API SHALL retornar `404`
3. WHEN o usuário exclui um board THEN o Angular SHALL exibir modal de confirmação antes de prosseguir
4. WHEN a exclusão é confirmada THEN o Angular SHALL remover o board da lista e redirecionar para `/boards` se estiver dentro do board

**Independent Test**: Excluir board via UI → some da lista; navegar para URL do board excluído → 404.

---

## Campos do Board

| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `name` | string | Sim | Texto livre, max 100 chars |
| `description` | string | Não | Texto livre, max 500 chars |
| `createdAt` | datetime | Auto | Gerado pelo sistema |

---

## Impacto em Entidades Existentes

| Entidade | Mudança | Observação |
|---|---|---|
| `Column` | Adicionar campo `boardId` (FK obrigatória) | Migration necessária |
| `Card` | Nenhuma | Vinculação ao board via coluna já é suficiente |
| `GET /columns` | Filtrar por `boardId` (query param obrigatório) | Evita retornar todas as colunas de todos os boards |
| Seed de colunas padrão | Movido para criação de board (`POST /boards`) | Seed global deixa de existir |

---

## Edge Cases

- WHEN o nome do board tem apenas espaços THEN a API SHALL retornar `400`
- WHEN `GET /boards/{id}` é chamado com board de outro usuário THEN a API SHALL retornar `404` (isolamento por usuário)
- WHEN o usuário acessa `/boards/{id}` diretamente sem estar logado THEN o guard SHALL redirecionar para login

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| BRD-01 | P1: Criar — endpoint | Design | Pending |
| BRD-02 | P1: Criar — validações | Design | Pending |
| BRD-03 | P1: Criar — seed colunas padrão | Design | Pending |
| BRD-04 | P1: Criar — UI navega para board | Design | Pending |
| BRD-05 | P1: Listar — endpoint | Design | Pending |
| BRD-06 | P1: Listar — tela inicial pós-login | Design | Pending |
| BRD-07 | P1: Listar — estado vazio | Design | Pending |
| BRD-08 | P1: Abrir — endpoint GET /boards/{id} | Design | Pending |
| BRD-09 | P1: Abrir — navegação e carregamento | Design | Pending |
| BRD-10 | P1: Renomear — endpoint | Design | Pending |
| BRD-11 | P1: Renomear — UI | Design | Pending |
| BRD-12 | P1: Excluir — endpoint com cascade | Design | Pending |
| BRD-13 | P1: Excluir — modal confirmação | Design | Pending |
| BRD-14 | P1: Excluir — redirect pós-exclusão | Design | Pending |
| BRD-15 | Impacto: Column.boardId + migration | Design | Pending |
| BRD-16 | Impacto: GET /columns filtra por boardId | Design | Pending |

---

## Success Criteria

- [ ] CRUD completo de boards funciona via UI
- [ ] Cada board tem suas próprias colunas e cards isolados
- [ ] Tela de boards é a página inicial após o login
- [ ] Excluir board remove colunas e cards em cascade
- [ ] Rotas protegidas por autenticação
