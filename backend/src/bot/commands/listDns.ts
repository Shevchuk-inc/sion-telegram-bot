import { Context } from 'telegraf';
import { cloudflareService } from '../../services/cloudflare.service';
import { Domain } from '../../models';

export const listDnsCommand = async (ctx: Context): Promise<void> => {
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const args = text.split(' ').slice(1);

  if (args.length === 0) {
    await ctx.reply('❌ Вкажіть домен.\nПриклад: `/list_dns example.com`', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const domainName = args[0].toLowerCase();

  const domain = await Domain.findOne({ name: domainName });
  if (!domain) {
    await ctx.reply(`❌ Домен \`${domainName}\` не знайдено.`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  try {
    const records = await cloudflareService.listDNSRecords(domain.zoneId);

    if (records.length === 0) {
      await ctx.reply(`📭 Немає DNS записів для \`${domainName}\`.`, {
        parse_mode: 'Markdown',
      });
      return;
    }

    const recordList = records
      .map((r) => `• \`${r.id.slice(0, 8)}\` ${r.type} ${r.name} → ${r.content}`)
      .join('\n');

    await ctx.reply(`📋 *DNS записи для ${domainName}:*\n\n${recordList}`, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    await ctx.reply(`❌ Помилка: ${errorMessage}`);
  }
};
