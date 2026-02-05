import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { Telegraf } from 'telegraf';
import { createWebhookRouter } from './routes/webhook.routes';

export const createApp = (bot: Telegraf): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/webhook', createWebhookRouter(bot));

  return app;
};
