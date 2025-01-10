/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for Solus Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: Solus deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `Solus.ts` file.
//    For example, Solus Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `Solus.ts` file.
//
//    ```
//    if (Solus.deploy) {
//      Solus.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

Solus.metrics.enabled = !Solus.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  Solus.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  Solus.storage.storages.avatar.provider = 'cloudflare-r2';
  Solus.storage.storages.avatar.bucket = 'account-avatar';
  Solus.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.Solusassets.com/${key}`;

  Solus.storage.storages.blob.provider = 'cloudflare-r2';
  Solus.storage.storages.blob.bucket = `workspace-blobs-${
    Solus.Solus.canary ? 'canary' : 'prod'
  }`;

  Solus.storage.storages.copilot.provider = 'cloudflare-r2';
  Solus.storage.storages.copilot.bucket = `workspace-copilot-${
    Solus.Solus.canary ? 'canary' : 'prod'
  }`;
}

Solus.plugins.use('copilot', {
  openai: {},
  fal: {},
});
Solus.plugins.use('redis');
Solus.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
Solus.plugins.use('oauth');

if (Solus.deploy) {
  Solus.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  Solus.plugins.use('gcloud');
}
