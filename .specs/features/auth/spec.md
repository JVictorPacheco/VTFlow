# Auth — Specification

## Problem Statement

A aplicação precisa de autenticação para proteger os dados do usuário. Como é um app de uso pessoal, o sistema suporta um único usuário com login via usuário e senha, gerando um JWT que autoriza o acesso aos endpoints protegidos.

## Goals

- [ ] Usuário consegue se registrar com nome de usuário e senha
- [ ] Usuário consegue fazer login e receber um JWT válido
- [ ] Rotas do Angular são protegidas por guard — redireciona para login se não autenticado
- [ ] Token JWT é enviado automaticamente em todas as requisições HTTP ao backend

## Out of Scope

| Feature | Razão |
|---|---|
| OAuth (Google, GitHub) | Fora do v1 |
| Múltiplos usuários | App de uso pessoal |
| Refresh token | Complexidade desnecessária no v1 |
| Recuperação de senha | Fora do v1 |
| 2FA | Fora do v1 |

---

## User Stories

### P1: Registro de usuário ⭐ MVP

**User Story**: Como usuário, quero criar minha conta com nome de usuário e senha, para que eu possa acessar a aplicação.

**Why P1**: Sem registro não há como criar o usuário inicial para login.

**Acceptance Criteria**:

1. WHEN `POST /auth/register` é chamado com `username` e `password` válidos THEN a API SHALL criar o usuário com senha hasheada e retornar `201 Created`
2. WHEN `POST /auth/register` é chamado com um `username` já existente THEN a API SHALL retornar `409 Conflict`
3. WHEN `POST /auth/register` é chamado com `password` menor que 6 caracteres THEN a API SHALL retornar `400 Bad Request`
4. WHEN `POST /auth/register` é chamado com campos vazios THEN a API SHALL retornar `400 Bad Request`

**Independent Test**: Chamar `POST /auth/register` via Swagger/curl → receber 201 e verificar usuário no banco.

---

### P1: Login com JWT ⭐ MVP

**User Story**: Como usuário, quero fazer login com meu usuário e senha para receber um token JWT e acessar a aplicação.

**Why P1**: Sem login o usuário não consegue autenticar e acessar as features.

**Acceptance Criteria**:

1. WHEN `POST /auth/login` é chamado com credenciais válidas THEN a API SHALL retornar `200 OK` com `{ token: "..." }`
2. WHEN `POST /auth/login` é chamado com senha incorreta THEN a API SHALL retornar `401 Unauthorized`
3. WHEN `POST /auth/login` é chamado com usuário inexistente THEN a API SHALL retornar `401 Unauthorized`
4. WHEN o token JWT é gerado THEN ele SHALL ter expiração de 8 horas

**Independent Test**: Chamar `POST /auth/login` com credenciais válidas → receber token → decodificar JWT e verificar claims.

---

### P1: Proteção de rotas no backend ⭐ MVP

**User Story**: Como sistema, quero que endpoints da API (exceto `/auth/*` e `/health`) exijam JWT válido, para que dados do usuário sejam protegidos.

**Why P1**: Sem proteção qualquer pessoa poderia acessar os dados.

**Acceptance Criteria**:

1. WHEN uma requisição sem token chega a um endpoint protegido THEN a API SHALL retornar `401 Unauthorized`
2. WHEN uma requisição com token inválido/expirado chega THEN a API SHALL retornar `401 Unauthorized`
3. WHEN uma requisição com token válido chega THEN a API SHALL processar normalmente
4. WHEN `GET /health` e `POST /auth/*` são chamados sem token THEN a API SHALL responder normalmente (rotas públicas)

**Independent Test**: Chamar `GET /api/test-auth` (endpoint protegido de teste) sem token → 401; com token → 200.

---

### P1: Tela de login no Angular ⭐ MVP

**User Story**: Como usuário, quero uma tela de login com formulário de usuário e senha, para que eu possa me autenticar na aplicação.

**Why P1**: Ponto de entrada da aplicação — sem login o usuário não acessa nada.

**Acceptance Criteria**:

1. WHEN o usuário acessa qualquer rota sem estar autenticado THEN o Angular SHALL redirecionar para `/login`
2. WHEN o usuário preenche credenciais válidas e submete THEN o Angular SHALL salvar o token e redirecionar para `/board`
3. WHEN o login falha THEN o Angular SHALL exibir mensagem de erro
4. WHEN o usuário está autenticado e acessa `/login` THEN o Angular SHALL redirecionar para `/board`
5. WHEN o token é salvo THEN ele SHALL ser armazenado no `localStorage`

**Independent Test**: Abrir app → redireciona para `/login` → preencher credenciais → redireciona para `/board`.

---

### P1: Interceptor HTTP com JWT ⭐ MVP

**User Story**: Como desenvolvedor, quero que o token JWT seja adicionado automaticamente a todas as requisições HTTP, para que não precise passar o token manualmente em cada chamada.

**Why P1**: Sem interceptor, cada serviço Angular precisaria gerenciar o token manualmente.

**Acceptance Criteria**:

1. WHEN uma requisição HTTP é feita enquanto o usuário está autenticado THEN o interceptor SHALL adicionar o header `Authorization: Bearer <token>`
2. WHEN o usuário não está autenticado THEN o interceptor SHALL deixar a requisição passar sem modificação
3. WHEN a API retorna `401` THEN o interceptor SHALL redirecionar o usuário para `/login` e limpar o token

**Independent Test**: Fazer requisição autenticada e inspecionar o header `Authorization` no Network tab do browser.

---

### P2: Tela de registro no Angular

**User Story**: Como usuário, quero uma tela de registro para criar minha conta diretamente pela UI.

**Why P2**: Importante para UX, mas o registro também pode ser feito via Swagger/curl no v1.

**Acceptance Criteria**:

1. WHEN o usuário acessa `/register` THEN o Angular SHALL exibir formulário de registro
2. WHEN o registro é bem-sucedido THEN o Angular SHALL redirecionar para `/login`
3. WHEN o registro falha (ex: usuário já existe) THEN o Angular SHALL exibir mensagem de erro

**Independent Test**: Acessar `/register` → preencher formulário → submeter → redirecionar para `/login`.

---

### P2: Logout

**User Story**: Como usuário, quero um botão de logout para encerrar minha sessão.

**Why P2**: Boa prática de segurança, mas não bloqueia o MVP.

**Acceptance Criteria**:

1. WHEN o usuário clica em logout THEN o Angular SHALL remover o token do `localStorage`
2. WHEN o token é removido THEN o Angular SHALL redirecionar para `/login`

**Independent Test**: Clicar em logout → token removido → redireciona para `/login`.

---

## Edge Cases

- WHEN o token expira enquanto o usuário está na aplicação THEN a próxima requisição SHALL retornar 401 e redirecionar para `/login`
- WHEN o `localStorage` é limpo externamente THEN o guard SHALL detectar ausência do token e redirecionar para `/login`
- WHEN o formulário de login é submetido com campos vazios THEN a UI SHALL exibir validação antes de chamar a API

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| AUTH-01 | P1: Registro — endpoint | Design | Pending |
| AUTH-02 | P1: Registro — validações | Design | Pending |
| AUTH-03 | P1: Login — endpoint + JWT | Design | Pending |
| AUTH-04 | P1: Login — expiração 8h | Design | Pending |
| AUTH-05 | P1: Proteção de rotas backend | Design | Pending |
| AUTH-06 | P1: Rotas públicas (/health, /auth/*) | Design | Pending |
| AUTH-07 | P1: Tela de login Angular | Design | Pending |
| AUTH-08 | P1: Guard de rotas Angular | Design | Pending |
| AUTH-09 | P1: Token no localStorage | Design | Pending |
| AUTH-10 | P1: Interceptor HTTP JWT | Design | Pending |
| AUTH-11 | P2: Tela de registro Angular | Design | Pending |
| AUTH-12 | P2: Logout | Design | Pending |

---

## Success Criteria

- [ ] `POST /auth/register` cria usuário com senha hasheada
- [ ] `POST /auth/login` retorna JWT válido
- [ ] Endpoints protegidos retornam 401 sem token
- [ ] App Angular redireciona para `/login` sem autenticação
- [ ] Login na UI salva token e redireciona para `/board`
- [ ] Todas as requisições Angular incluem o header `Authorization`
