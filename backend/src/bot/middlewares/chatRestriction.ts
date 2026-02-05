import { Context, MiddlewareFn } from 'telegraf';
import { config } from '../../config';

export const chatRestriction: MiddlewareFn<Context> = async (ctx, next) => {
  const chatId = ctx.chat?.id?.toString();
  const allowedChatId = config.telegram.allowedChatId;

  if (ctx.chat?.type === 'private') {
    return next();
  }

  if (chatId !== allowedChatId) {
    console.log(`Blocked message from unauthorized chat: ${chatId}`);
    return;
  }

  return next();
};
