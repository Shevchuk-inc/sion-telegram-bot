import { config, validateConfig } from './config';
import { createApp } from './app';
import { connectDatabase } from './services/database.service';
import { createBot, startBot } from './bot';

validateConfig();

const start = async (): Promise<void> => {
  await connectDatabase();

  const bot = createBot();
  startBot(bot);

  const app = createApp(bot);

  app.listen(config.server.port, () => {
    console.log(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
