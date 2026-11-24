---
name: angular-templates
description: >-
  Правила Angular-шаблонов about-me. Используй при изменении .html, inline
  template, bindings, control flow или доступности. Не используй для задач
  только с TypeScript-логикой или стилями.
---

# Angular-шаблоны

- В `@for` выбирай стабильный ключ; `$index` подходит только для статичного списка.
- Шаблонные переменные называй в `camelCase`.
- Оставляй шаблоны простыми.
- Предпочитай прямые привязки: `[class.active]` и `[style.width.px]`.
- Host-классы, атрибуты и обработчики описывай в `host` метаданных компонента или директивы.
- Действия оформляй через `button`, переходы — через `a`; не убирай видимый фокус.
- Если шаблон читает signals, Observable или производные значения, прочитай [reactive-values.md](references/reactive-values.md).
