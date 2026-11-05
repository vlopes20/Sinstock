import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { Response } from 'express';
import { frontendRoot } from './project-paths';

export function mountFrontend(app: NestExpressApplication) {
  const frontend = frontendRoot;
  for (const folder of ['assets', 'js', 'pages']) {
    app.useStaticAssets(join(frontend, folder), {
      prefix: `/frontend/${folder}/`,
    });
  }
  for (const route of ['/frontend/', '/frontend/index.html']) {
    app
      .getHttpAdapter()
      .get(route, (_req, res: Response) =>
        res.sendFile(join(frontend, 'index.html')),
      );
  }
}
