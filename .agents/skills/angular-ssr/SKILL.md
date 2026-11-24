---
name: angular-ssr
description: >-
  Правила SSR about-me. Используй для server.ts, server config/routes,
  гидратации, TransferState, cookies и согласования сервера с браузером. Не
  используй для обычных browser-only компонентов.
---

# Angular SSR и гидратация

- Не обращайся к `window`, `document`, browser cookies и другим браузерным API в серверном контексте без платформенной проверки или подходящей DI-абстракции.
- Согласовывай первоначальное состояние сервера и браузера, чтобы гидратация не меняла уже отрисованную разметку.
- Учитывай установленную версию Angular 21 и текущие `app.config.server.ts`, `app.routes.server.ts` и `server.ts`.
- При изменении `TransferState`, cookies, состояния запросов или кеширования прочитай [state-and-caching.md](references/state-and-caching.md).
