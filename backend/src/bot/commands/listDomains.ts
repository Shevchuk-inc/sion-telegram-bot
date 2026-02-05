import { Context } from 'telegraf';
import { Domain } from '../../models';

export const listDomainsCommand = async (ctx: Context): Promise<void> => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });

    if (domains.length === 0) {
      await ctx.reply('📭 Немає зареєстрованих доменів.');
      return;
    }

    const domainList = domains
      .map((d, i) => `${i + 1}. \`${d.name}\` — ${d.status}`)
      .join('\n');

    await ctx.reply(`📋 *Зареєстровані домени:*\n\n${domainList}`, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    await ctx.reply(`❌ Помилка: ${errorMessage}`);
  }
};
