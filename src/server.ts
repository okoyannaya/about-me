import { join } from 'node:path';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    ...(process.env['NG_ALLOWED_HOSTS']
      ?.split(',')
      .map((host) => host.trim())
      .filter(Boolean) ?? []),
    ...(process.env['RENDER_EXTERNAL_HOSTNAME'] ? [process.env['RENDER_EXTERNAL_HOSTNAME']] : []),
  ],
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use(async (req, res, next) => {
  try {
    const response = await angularApp.handle(req);
    if (!response) return next();

    const theme = /(?:^|;\s*)currentTheme=(light|dark)(?:;|$)/.exec(req.headers.cookie ?? '')?.[1];
    if (!theme) return writeResponseToNodeResponse(response, res);

    const html = (await response.text()).replace(
      /<html\b([^>]*)>/i,
      `<html$1 data-theme="${theme}">`,
    );

    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return writeResponseToNodeResponse(
      new Response(html, { status: response.status, headers }),
      res,
    );
  } catch (error) {
    next(error);
  }
});
/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
