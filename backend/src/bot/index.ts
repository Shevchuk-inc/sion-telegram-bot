import { Telegraf } from 'telegraf';
import { config } from '../config';
import { chatRestriction } from './middlewares/chatRestriction';

export const createBot = (): Telegraf => {
  const bot = new Telegraf(config.telegram.botToken);

  bot.use(chatRestriction);

  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx.updateType}:`, err);
  });

  return bot;
};

export const startBot = async (bot: Telegraf): Promise<void> => {
  await bot.launch();
  console.log('Telegram bot started');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
