export type SyncEntityType = 'match_record' | 'user_statistics' | 'settings';

export type SyncStatus = 'pending' | 'in_progress' | 'synced' | 'failed';

export interface SyncRecord<T = unknown> {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  payload: T;
  status: SyncStatus;
  retryCount: number;
  errorMessage?: string;
  createdAt: string;       // ISO timestamp
  lastAttemptAt?: string;  // ISO timestamp
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}
