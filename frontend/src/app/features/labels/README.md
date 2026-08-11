---
tags:
  - frontend
  - features
  - labels
---

# Labels Feature

## Objetivo do Módulo

Tela de gerenciamento global de etiquetas (labels): criação, edição, exclusão e visualização.

## Funcionalidades

### `LabelsComponent` (`labels.component.ts`) — 153 linhas

- **Listagem**: Grid de etiquetas com bolinha colorida e nome
- **Criação**: Modal com input de nome + input de cor (type color)
- **Edição**: Mesmo modal, preenchido com dados da etiqueta existente
- **Exclusão**: Remove etiqueta globalmente
- **Validação de cor**: Input `<input type="color">` garante cor hex válida no frontend; backend valida com regex `^#[0-9A-Fa-f]{6}$`
- **Header**: Título "Etiquetas", voltar para boards, toggle de tema

## Dependências Internas

- [[../../core/services/README]] — `LabelService`, `ThemeService`

## Dependências Externas

- `@angular/forms` — ReactiveFormsModule, FormBuilder
- `@angular/router` — Router, RouterLink

## Rota

| Rota | Componente | Auth |
|---|---|---|
| `/labels` | `LabelsComponent` | JWT |

## Fluxos Importantes

### Criação
```
[+ Nova Etiqueta] → modal → preenche nome + cor → LabelService.create(name, color)
  → POST /labels
  → backend valida: nome obrigatório, cor hex #RRGGBB, unicidade do nome
  → 201/409 → atualiza lista local
```

### Edição
```
[clique na etiqueta] → modal preenchido → LabelService.update(id, name, color)
  → PUT /labels/:id
```

## Observações Técnicas

- Etiquetas são **globais** — sem vínculo com board. Todos os boards compartilham o mesmo conjunto de etiquetas.
- O input de cor nativo (`<input type="color">`) já retorna valor hex, mas o backend também valida com regex.
- Ao excluir uma etiqueta, os cards que a possuíam perdem a associação (sem warning).
