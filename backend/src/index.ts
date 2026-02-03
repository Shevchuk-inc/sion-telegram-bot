import { config, validateConfig } from './config';
import { createApp } from './app';
import { connectDatabase } from './services/database.service';

validateConfig();

const start = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();

  app.listen(config.server.port, () => {
    console.log(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
