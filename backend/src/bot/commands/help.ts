import { Context } from 'telegraf';

export const helpCommand = async (ctx: Context): Promise<void> => {
  await ctx.reply(
    `📚 *Доступні команди:*\n\n` +
    `*Загальні:*\n` +
    `/start - Почати роботу з ботом\n` +
    `/help - Показати це повідомлення\n\n` +
    `*Домени:*\n` +
    `/register_domain <domain> - Зареєструвати домен\n` +
    `/list_domains - Список доменів\n\n` +
    `*DNS записи:*\n` +
    `/add_dns <domain> <type> <name> <content> - Додати DNS запис\n` +
    `/list_dns <domain> - Список DNS записів\n` +
    `/update_dns <domain> <record_id> <content> - Оновити DNS запис\n` +
    `/delete_dns <domain> <record_id> - Видалити DNS запис`,
    { parse_mode: 'Markdown' }
  );
};
