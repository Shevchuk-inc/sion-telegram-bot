import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    allowedChatId: process.env.ALLOWED_CHAT_ID || '',
  },
  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudflare-bot',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

export const validateConfig = (): void => {
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'ALLOWED_CHAT_ID',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
  ];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
};
