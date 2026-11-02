export interface EnvConfig {
  nodeEnv: string;
  port: number;
  host: string;
  corsOrigin: string;
  jwtSecret: string;
  firebaseProjectId?: string;
  databaseUrl?: string;
}

export const ENV: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'carromverse-dev-secret-key-123',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'carromverse-dev',
  databaseUrl: process.env.DATABASE_URL,
};

