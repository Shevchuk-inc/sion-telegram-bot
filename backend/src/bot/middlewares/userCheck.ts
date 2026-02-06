import { Context, MiddlewareFn } from 'telegraf';
import { User } from '../../models';

export const userCheck: MiddlewareFn<Context> = async (ctx, next) => {
  if (!ctx.from) return next();

  try {
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username || ctx.from.first_name || 'Unknown';

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = await User.create({ telegramId, username, isAllowed: true });
    }

    if (!user.isAllowed) {
      await ctx.reply('❌ У вас немає доступу до цього бота.');
      return;
    }

    return next();
  } catch {
    return next();
  }
};
