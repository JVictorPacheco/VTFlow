---
tags:
  - git
  - gitflow
  - workflow
created: 2026-08-10
---

# GitFlow - Estratégia de Branches

## O que é GitFlow

GitFlow é um modelo de branching criado por Vincent Driessen que define uma estrutura rigorosa de branches para organizar o desenvolvimento de software. Ele separa branches de **desenvolvimento** (feature, develop) de branches de **produção** (main, hotfix, release).

## Estrutura de Branches

```
main
  │
  ├── develop
  │     │
  │     ├── feature/multi-tenancy
  │     ├── feature/exception-handler
  │     ├── feature/jwt-user-secrets
  │     └── feature/card-filters
  │
  ├── release/1.0.0
  │
  └── hotfix/cors-production-fix
```

## Branches Principais

| Branch | Propósito | Deploy |
|---|---|---|
| `main` | Código em produção. Apenas merge de `release/*` e `hotfix/*`. | Produção |
| `develop` | Branch de integração. Features são mergeadas aqui. | Staging/Dev |

## Branches de Suporte

| Tipo | Nomenclatura | Ramifica de | Mergeia em | Vida útil |
|---|---|---|---|---|
| **Feature** | `feature/<descricao>` | `develop` | `develop` | Temporária (deletada após merge) |
| **Release** | `release/<versao>` | `develop` | `main` + `develop` | Temporária |
| **Hotfix** | `hotfix/<descricao>` | `main` | `main` + `develop` | Temporária |

## Fluxo de Trabalho

### 1. Criar Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
# ... desenvolve, commita ...
git push -u origin feature/nome-da-feature
```

### 2. Finalizar Feature (via Pull Request)

```bash
# Criar PR no GitHub: feature/nome-da-feature → develop
# Após revisão e merge, deletar a branch:
git branch -d feature/nome-da-feature
git push origin --delete feature/nome-da-feature
```

### 3. Criar Release

```bash
git checkout develop
git checkout -b release/1.0.0
# Ajustar versão em package.json, .csproj, changelog
git commit -m "chore: bump version to 1.0.0"
git push -u origin release/1.0.0
# Criar PR: release/1.0.0 → main (e também merge em develop)
```

### 4. Hotfix de Produção

```bash
git checkout main
git checkout -b hotfix/descricao-do-fix
# ... corrige, commita ...
# Criar PR: hotfix/descricao-do-fix → main (e também merge em develop)
```

## Convenções de Commit

Seguir **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
<tipo>(<escopo>): <descrição>
```

**Tipos**:
| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudar comportamento |
| `test` | Adição/alteração de testes |
| `docs` | Documentação |
| `chore` | Tarefas de build, CI, dependências |
| `style` | Formatação, linting |

**Escopos sugeridos**:
| Escopo | Área |
|---|---|
| `auth` | Autenticação |
| `board` | Boards e colunas |
| `card` | Cards |
| `label` | Etiquetas |
| `subtask` | Subtarefas |
| `comment` | Comentários |
| `ui` | Interface/frontend |
| `api` | Backend/API |
| `db` | Banco de dados |

**Exemplos**:
```
feat(card): add card filter by priority
fix(auth): handle expired token gracefully
docs(api): document board endpoints
refactor(board): extract board logic to service
test(card): add unit tests for card controller
chore(ci): setup GitHub Actions pipeline
```

## Padrão de Versionamento

Usar **SemVer** (Semantic Versioning): `MAJOR.MINOR.PATCH`

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis

**Versão atual hipotética**: `0.1.0` (MVP, pré-lançamento estável)

## Proteção de Branches (Configurar no GitHub)

| Branch | Regra |
|---|---|
| `main` | Requer PR + review + CI passando. Push direto bloqueado. |
| `develop` | Requer PR + CI passando. Push direto bloqueado. |
| `feature/*` | Sem restrições (branch individual do dev) |
| `release/*` | Requer PR + review + CI passando |
| `hotfix/*` | Requer PR + review + CI passando |

## Configuração Inicial para o Projeto

```bash
# 1. Verificar branches atuais
git branch -a

# 2. Criar develop a partir da branch atual (provavelmente main/master)
git checkout -b develop
git push -u origin develop

# 3. Configurar branch padrão no GitHub como develop
# Settings → Branches → Default branch → develop

# 4. Proteger main e develop (via GitHub Settings)
```

## Pull Request Template

Criar arquivo `.github/pull_request_template.md`:

```markdown
## Descrição

<!-- Descreva o que este PR faz -->

## Tipo de Mudança

- [ ] feat (nova funcionalidade)
- [ ] fix (correção de bug)
- [ ] refactor
- [ ] test
- [ ] docs
- [ ] chore

## Checklist

- [ ] Código segue as convenções do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada (se aplicável)
- [ ] Build passa localmente
- [ ] Lint passa localmente
```
