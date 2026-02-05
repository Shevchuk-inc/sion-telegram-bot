import { Context } from 'telegraf';
import { cloudflareService } from '../../services/cloudflare.service';
import { Domain } from '../../models';

export const addDnsCommand = async (ctx: Context): Promise<void> => {
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const args = text.split(' ').slice(1);

  if (args.length < 4) {
    await ctx.reply(
      '❌ Невірний формат.\n' +
        'Використання: `/add_dns <domain> <type> <name> <content>`\n\n' +
        'Приклад: `/add_dns example.com A www 192.168.1.1`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const [domainName, type, name, content] = args;

  const domain = await Domain.findOne({ name: domainName.toLowerCase() });
  if (!domain) {
    await ctx.reply(`❌ Домен \`${domainName}\` не знайдено.`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  try {
    const record = await cloudflareService.createDNSRecord(
      domain.zoneId,
      type.toUpperCase(),
      name,
      content
    );

    await ctx.reply(
      `✅ DNS запис створено!\n\n` +
        `• ID: \`${record.id}\`\n` +
        `• Тип: ${record.type}\n` +
        `• Ім'я: ${record.name}\n` +
        `• Значення: ${record.content}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    await ctx.reply(`❌ Помилка: ${errorMessage}`);
  }
};
