---
tags:
  - spec
  - template
created: 2026-08-10
---

# Spec Template

Template para criar especificações de features em `.specs/`.

---

```
---
feature: NOME_DA_FEATURE
status: rascunho | revisão | aprovado | implementado
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [Nome da Feature]

## Motivação
- **Problema**: [Qual problema esta feature resolve?]
- **Objetivo**: [O que se espera alcançar?]

## Escopo
### Dentro do escopo
- [Item 1]

### Fora do escopo
- [Item 1]

## Requisitos Funcionais

### RF01 - [Título]
**Como** [ator]
**Quero** [ação]
**Para** [objetivo]

**Critérios de aceitação**:
- [ ] [Critério]

## Regras de Negócio
- **RN01**: [Descrição]

## Modelo de Dados
| Entidade | Campos | Relacionamentos |
|---|---|---|

## Endpoints da API
| Método | Rota | Descrição | Auth |
|---|---|---|---|

## Cenários

### Cenário 1: Sucesso
**Dado** [pré-condição]
**Quando** [ação]
**Então** [resultado]

### Cenário 2: Erro
**Dado** [pré-condição]
**Quando** [ação inválida]
**Então** [erro: código + mensagem]

## UI/UX
- **Tela**: [Descrição]
- **Estados**: [Loading, vazio, erro, sucesso]

## Dependências
- Depende de: [Feature X]
- Bloqueia: [Feature Y]

## Riscos
- [Risco]: [Mitigação]
```
