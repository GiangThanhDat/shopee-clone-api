import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// process.loadEnvFile() writes to Node's real process.env, which Jest's sandbox does not see.
// .env is optional in CI, where variables come from the environment, and never overrides them.
if (existsSync('.env')) {
  process.env = { ...parseEnv(readFileSync('.env', 'utf8')), ...process.env };
}

const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME_TEST',
];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);
if (missingVariables.length > 0) {
  throw new Error(`Missing env for e2e: ${missingVariables.join(', ')}`);
}

// e2e tests rebuild the schema, so they must never point at the dev database
process.env.DB_NAME = process.env.DB_NAME_TEST;
