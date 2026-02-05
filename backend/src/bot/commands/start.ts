import { Context } from 'telegraf';

export const startCommand = async (ctx: Context): Promise<void> => {
  const username = ctx.from?.username || ctx.from?.first_name || 'User';
  
  await ctx.reply(
    `👋 Привіт, ${username}!\n\n` +
    `Я бот для управління доменами та DNS записами через Cloudflare API.\n\n` +
    `Використовуй /help для списку команд.`
  );
};
