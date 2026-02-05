import { Context } from 'telegraf';
import { cloudflareService } from '../../services/cloudflare.service';
import { Domain } from '../../models';

export const deleteDnsCommand = async (ctx: Context): Promise<void> => {
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const args = text.split(' ').slice(1);

  if (args.length < 2) {
    await ctx.reply(
      '❌ Невірний формат.\n' +
        'Використання: `/delete_dns <domain> <record_id>`\n\n' +
        'Приклад: `/delete_dns example.com abc123`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const [domainName, recordId] = args;

  const domain = await Domain.findOne({ name: domainName.toLowerCase() });
  if (!domain) {
    await ctx.reply(`❌ Домен \`${domainName}\` не знайдено.`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  try {
    const records = await cloudflareService.listDNSRecords(domain.zoneId);
    const record = records.find((r) => r.id.startsWith(recordId));

    if (!record) {
      await ctx.reply(`❌ DNS запис з ID \`${recordId}\` не знайдено.`, {
        parse_mode: 'Markdown',
      });
      return;
    }

    await cloudflareService.deleteDNSRecord(domain.zoneId, record.id);

    await ctx.reply(`✅ DNS запис \`${record.name}\` (${record.type}) видалено.`, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    await ctx.reply(`❌ Помилка: ${errorMessage}`);
  }
};
