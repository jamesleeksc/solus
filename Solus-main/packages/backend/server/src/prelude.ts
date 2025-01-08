import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultsolusConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const solus_CONFIG_PATH = process.env.solus_CONFIG_PATH ?? configDir;
  // Initializing solus config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(solus_CONFIG_PATH, '.env'),
  });

  // 2. generate solus default config and assign to `globalThis.solus`
  globalThis.solus = getDefaultsolusConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/solus.env`
  // 3. load env => config map to `globalThis.solus.ENV_MAP
  await loadRemote(solus_CONFIG_PATH, 'solus.env.js');

  // 4. load `config/solus` to patch custom configs
  await loadRemote(solus_CONFIG_PATH, 'solus.js');

  // 5. load `config/solus.self` to patch custom configs
  // This is the file only take effect in [solus Cloud]
  if (!solus.isSelfhosted) {
    await loadRemote(solus_CONFIG_PATH, 'solus.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.solus`
  applyEnvToConfig(globalThis.solus);

  if (solus.node.dev) {
    console.log(
      'solus Config:',
      JSON.stringify(omit(globalThis.solus, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
