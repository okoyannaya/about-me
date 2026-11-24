---
name: angular-typescript
description: >-
  Правила TypeScript-логики Angular в about-me. Используй для прикладных .ts:
  компонентов, сервисов, signals, DI и типов. Не используй для задач
  только с HTML, SCSS, тестами, SSR или документацией.
---

# Angular и TypeScript

Применяй эти правила только к затронутой TypeScript-логике.

- Булевы значения начинай с `is`, `has`, `can` или `should`.
- Observable называй с суффиксом `$`. Signals специальных суффиксов не получают.
- Методы называй по действию. Повторяющиеся строковые варианты оформляй строковым enum.
- Для неизвестных данных используй `unknown` и проверки; избегай необоснованных `as` и `!`.
- Не аннотируй очевидные типы. Стабильные ссылки, inputs, outputs, models и queries помечай `readonly`.
- Детали реализации делай `private`, члены только для шаблона — `protected`, публичными оставляй API.
- Размещай зависимости, inputs, outputs, queries и поля перед методами.

## Условные правила

- При изменении API компонента или стратегии обнаружения изменений прочитай [components.md](references/components.md).
- При работе с signals, Observable или подписками прочитай [reactivity.md](references/reactivity.md).
