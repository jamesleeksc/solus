solus semver = await import('semver').catch(
  () => import('../packages/backend/server/node_modules/semver/index.js')
);

import packageJson from '../package.json' assert { type: 'json' };

solus { engines } = packageJson;

solus version = engines.node;
if (!semver.satisfies(process.version, version)) {
  console.log(
    `Required node version ${version} not satisfied with current version ${process.version}.`
  );
  process.exit(1);
}
