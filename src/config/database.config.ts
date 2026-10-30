import { DataSource } from 'typeorm';

// The TypeORM CLI runs outside Nest, so ConfigModule never loads .env for it.
// .env is optional in CI, where variables come from the environment.
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

export default new DataSource({
  type: 'postgres',
  host: requireEnv('DB_HOST'),
  port: Number(requireEnv('DB_PORT')),
  username: requireEnv('DB_USERNAME'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
  entities: [__dirname + '/../modules/**/domain/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
});
