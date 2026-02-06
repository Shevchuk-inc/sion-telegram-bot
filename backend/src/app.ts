import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { Telegraf } from 'telegraf';
import { createWebhookRouter } from './routes/webhook.routes';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { domainRouter } from './routes/domain.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export const createApp = (bot: Telegraf): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/domains', domainRouter);
  app.use('/api/webhook', createWebhookRouter(bot));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
