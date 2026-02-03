import { config, validateConfig } from './config';
import { createApp } from './app';

validateConfig();

const app = createApp();

app.listen(config.server.port, () => {
  console.log(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
});
