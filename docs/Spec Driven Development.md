---
tags:
  - spec-driven-development
  - workflow
created: 2026-08-10
---

# Spec Driven Development

## O que é

Neste projeto, **Spec Driven Development** significa que toda nova funcionalidade começa com uma especificação escrita, que serve como contrato do que será implementado. O código é escrito **depois**, seguindo a spec como guia.

## Pasta de Specs

A pasta `.specs/` (raiz do projeto, gitignored) é o espaço de trabalho para specs individuais. Cada feature tem seu próprio arquivo `.spec.md`.

> **Importante**: `.specs/` é gitignored intencionalmente. As specs são documentos de planejamento que guiam o desenvolvimento, não artefatos versionados.

## Estrutura de uma Spec

Use o template em [[Spec Template]] como ponto de partida. Uma spec deve conter:

1. **Motivação**: Problema que resolve
2. **Escopo**: O que está dentro e fora
3. **Requisitos Funcionais**: Formato "Como... quero... para..."
4. **Regras de Negócio**: Condições e restrições
5. **Modelo de Dados**: Entidades afetadas
6. **Endpoints**: Contratos da API
7. **Cenários**: Comportamento esperado (dado/quando/então)
8. **Dependências e Riscos**

## Fluxo de Trabalho

```
[Spec escrita] → [Revisão da spec] → [Implementação guiada pela spec] → [Testes contra a spec]
```

1. **Escrever spec** em `.specs/feature-nome.spec.md` usando o [[Spec Template]]
2. **Revisar spec** com o time (PR de spec, se aplicável)
3. **Implementar** seguindo a spec como contrato
4. **Testar** contra os cenários descritos na spec
5. **Arquivar** ou descartar a spec após implementação (opcional)

## Spec vs Documentação

| Artefato | Local | Propósito |
|---|---|---|
| **Spec** | `.specs/` | Guia de implementação, pré-código |
| **Documentação** | `docs/` | Referência técnica, pós-código |

A documentação em `docs/` descreve o sistema como ele **é**. As specs em `.specs/` descrevem como ele **deve ser**.

## Specs Retroativas

Como o código atual foi desenvolvido antes das specs, recomenda-se escrever specs retroativas para:

- Documentar formalmente o comportamento existente
- Facilitar onboarding de novos desenvolvedores
- Servir de base para testes automatizados
- Identificar inconsistências entre o que existe e o que deveria existir
