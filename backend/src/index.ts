import { config, validateConfig } from './config';

validateConfig();

console.log(`Backend starting in ${config.server.nodeEnv} mode on port ${config.server.port}...`);
