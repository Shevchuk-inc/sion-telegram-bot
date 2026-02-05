import { Telegraf } from 'telegraf';
import { config } from '../config';
import { chatRestriction } from './middlewares/chatRestriction';
import { startCommand, helpCommand, registerDomainCommand } from './commands';

export const createBot = (): Telegraf => {
  if (!config.telegram.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }
  
  const bot = new Telegraf(config.telegram.botToken);

  bot.use(chatRestriction);

  bot.command('start', startCommand);
  bot.command('help', helpCommand);
  bot.command('register_domain', registerDomainCommand);

  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx.updateType}:`, err);
  });

  return bot;
};

export const startBot = (bot: Telegraf): void => {
  bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('Telegram bot started'))
    .catch((error) => console.error('Failed to start bot:', error));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
