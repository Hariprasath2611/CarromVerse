export interface DatabaseConfig {
  type: 'firebase' | 'sqlite' | 'postgresql';
  isConnected: boolean;
  firestoreCollectionPrefix?: string;
  sqlitePath?: string;
}

export const DATABASE_CONFIG: DatabaseConfig = {
  type: 'firebase',
  isConnected: false,
  firestoreCollectionPrefix: 'carromverse_',
  sqlitePath: './carromverse.sqlite',
};

