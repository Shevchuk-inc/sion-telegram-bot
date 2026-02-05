import { Context } from 'telegraf';
import { cloudflareService } from '../../services/cloudflare.service';
import { Domain } from '../../models';

export const registerDomainCommand = async (ctx: Context): Promise<void> => {
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const args = text.split(' ').slice(1);

  if (args.length === 0) {
    await ctx.reply('❌ Вкажіть домен.\nПриклад: `/register_domain example.com`', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const domainName = args[0].toLowerCase();

  const existingDomain = await Domain.findOne({ name: domainName });
  if (existingDomain) {
    await ctx.reply(`❌ Домен \`${domainName}\` вже зареєстровано.`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  await ctx.reply(`⏳ Реєструю домен \`${domainName}\`...`, {
    parse_mode: 'Markdown',
  });

  try {
    const zone = await cloudflareService.createZone(domainName);

    const domain = new Domain({
      name: domainName,
      zoneId: zone.id,
      nameServers: zone.name_servers,
      status: zone.status,
    });

    await domain.save();

    const nsServers = zone.name_servers.map((ns) => `• \`${ns}\``).join('\n');

    await ctx.reply(
      `✅ Домен \`${domainName}\` успішно зареєстровано!\n\n` +
        `📋 *NS сервери для налаштування:*\n${nsServers}\n\n` +
        `Додайте ці NS сервери у вашого реєстратора домену.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
    await ctx.reply(`❌ Помилка реєстрації: ${errorMessage}`);
  }
};
