// .env is optional in CI, where variables come from the environment
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

// e2e tests rebuild the schema, so they must never point at the dev database
process.env.DB_NAME = process.env.DB_NAME_TEST ?? 'shopee_clone_test';
