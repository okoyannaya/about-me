# Компоненты Angular

- Inputs и outputs описывай через `input()`, `input.required()` и `output()`; для намеренной двусторонней связи используй `model()`.
- Inputs называй по данным, outputs — по произошедшему событию.
- Проект использует Angular 21: не переноси предположения из более новых версий. `ChangeDetectionStrategy.OnPush` задавай явно там, где он требуется.
