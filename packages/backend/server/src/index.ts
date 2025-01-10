/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = solus.deploy ? '0.0.0.0' : 'localhost';
await app.listen(solus.port, listeningHost);

const logger = new Logger('App');

logger.log(`solus Server is running in [${solus.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${solus.port}`);
logger.log(`And the public server should be recognized as ${solus.baseUrl}`);
