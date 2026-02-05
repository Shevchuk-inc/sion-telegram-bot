import { Telegraf } from 'telegraf';
import { config } from '../config';
import { chatRestriction } from './middlewares/chatRestriction';
import { userCheck } from './middlewares/userCheck';
import {
  startCommand,
  helpCommand,
  registerDomainCommand,
  listDomainsCommand,
  addDnsCommand,
  listDnsCommand,
  updateDnsCommand,
  deleteDnsCommand,
} from './commands';

export const createBot = (): Telegraf => {
  if (!config.telegram.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }
  
  const bot = new Telegraf(config.telegram.botToken);

  bot.use(chatRestriction);
  bot.use(userCheck);

  bot.command('start', startCommand);
  bot.command('help', helpCommand);
  bot.command('register_domain', registerDomainCommand);
  bot.command('list_domains', listDomainsCommand);
  bot.command('add_dns', addDnsCommand);
  bot.command('list_dns', listDnsCommand);
  bot.command('update_dns', updateDnsCommand);
  bot.command('delete_dns', deleteDnsCommand);

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
