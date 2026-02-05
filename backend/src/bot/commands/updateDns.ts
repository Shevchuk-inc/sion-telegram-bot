import { Context } from 'telegraf';
import { cloudflareService } from '../../services/cloudflare.service';
import { Domain } from '../../models';

export const updateDnsCommand = async (ctx: Context): Promise<void> => {
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const args = text.split(' ').slice(1);

  if (args.length < 3) {
    await ctx.reply(
      '❌ Невірний формат.\n' +
        'Використання: `/update_dns <domain> <record_id> <new_content>`\n\n' +
        'Приклад: `/update_dns example.com abc123 192.168.1.2`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const [domainName, recordId, newContent] = args;

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

    const updated = await cloudflareService.updateDNSRecord(
      domain.zoneId,
      record.id,
      record.type,
      record.name,
      newContent
    );

    await ctx.reply(
      `✅ DNS запис оновлено!\n\n` +
        `• ID: \`${updated.id}\`\n` +
        `• Тип: ${updated.type}\n` +
        `• Ім'я: ${updated.name}\n` +
        `• Нове значення: ${updated.content}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    await ctx.reply(`❌ Помилка: ${errorMessage}`);
  }
};
