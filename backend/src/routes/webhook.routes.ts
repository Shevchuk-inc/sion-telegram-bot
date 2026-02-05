import { Router, Request, Response } from 'express';
import { Telegraf } from 'telegraf';
import { config } from '../config';

export const createWebhookRouter = (bot: Telegraf): Router => {
  const router = Router();

  router.post('/notify', async (req: Request, res: Response) => {
    try {
      const { title, message, type = 'info' } = req.body;

      if (!title || !message) {
        res.status(400).json({ error: 'title and message are required' });
        return;
      }

      const emoji = type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
      const text = `${emoji} *${title}*\n\n${message}`;

      await bot.telegram.sendMessage(config.telegram.allowedChatId, text, {
        parse_mode: 'Markdown',
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook notify error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  router.get('/notify', async (req: Request, res: Response) => {
    try {
      const { title, message, type = 'info' } = req.query;

      if (!title || !message) {
        res.status(400).json({ error: 'title and message query params are required' });
        return;
      }

      const emoji = type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
      const text = `${emoji} *${String(title)}*\n\n${String(message)}`;

      await bot.telegram.sendMessage(config.telegram.allowedChatId, text, {
        parse_mode: 'Markdown',
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook notify error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  return router;
};
