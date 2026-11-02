import { GameResult, SyncRecord, UserGameStatistics } from '@carromverse/shared-types';
import { generateUUID } from '@carromverse/shared-utils';
import { LocalDatabaseService } from '../database/localDatabaseService';
import { NetworkService } from './networkService';
import {
  getGameStatistics,
  syncMatchToFirestore,
  updateGameStatistics,
} from '../firebase/firebase.firestore';
import { auth } from '../firebase/firebase.config';

export class SyncService {
  private static isSyncing: boolean = false;
  private static syncListeners: Set<(isSyncing: boolean, pendingCount: number) => void> = new Set();

  public static initialize(): void {
    NetworkService.initialize();

    // Automatically trigger sync when connectivity is restored
    NetworkService.addListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        this.processPendingSyncQueue().catch((err) => {
          console.warn('[SyncService] Auto-sync failed:', err);
        });
      }
    });
  }

  public static async recordCompletedMatch(match: GameResult): Promise<void> {
    // 1. Always save locally first (Offline-first guarantee)
    await LocalDatabaseService.saveMatch(match);

    // 2. Queue for cloud synchronization if user is authenticated
    const currentUserId = auth?.currentUser?.uid;
    if (currentUserId) {
      const syncRecord: SyncRecord<GameResult> = {
        id: generateUUID(),
        entityType: 'match_record',
        entityId: match.id,
        payload: match,
        status: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString(),
      };

      await LocalDatabaseService.enqueueSyncItem(syncRecord);

      // Attempt immediate sync if online
      if (NetworkService.isOnline()) {
        this.processPendingSyncQueue().catch(() => {});
      }
    }
  }

  public static async processPendingSyncQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (!NetworkService.isOnline()) return { synced: 0, failed: 0 };

    const currentUserId = auth?.currentUser?.uid;
    if (!currentUserId) return { synced: 0, failed: 0 };

    this.isSyncing = true;
    this.notifyListeners();

    let synced = 0;
    let failed = 0;

    try {
      const pendingItems = await LocalDatabaseService.getPendingSyncQueue();

      for (const item of pendingItems) {
        try {
          if (item.entityType === 'match_record') {
            const match = item.payload as GameResult;

            // 1. Sync match document idempotently
            await syncMatchToFirestore(currentUserId, match);

            // 2. Update user stats in Firestore
            const stats = (await getGameStatistics(currentUserId)) || {
              userId: currentUserId,
              totalMatches: 0,
              individualWins: 0,
              teamWins: 0,
              totalPlayTime: 0,
              whiteCoinsPocketed: 0,
              blackCoinsPocketed: 0,
              queenPockets: 0,
              foulsCommitted: 0,
              lastUpdated: new Date().toISOString(),
            };

            const isWinner = match.winnerId === currentUserId;
            const isTeamWin = match.winningTeamId != null && isWinner;

            const updatedStats: Partial<UserGameStatistics> = {
              totalMatches: stats.totalMatches + 1,
              individualWins: stats.individualWins + (isWinner && !isTeamWin ? 1 : 0),
              teamWins: stats.teamWins + (isTeamWin ? 1 : 0),
              totalPlayTime: stats.totalPlayTime + match.durationSeconds,
            };

            await updateGameStatistics(currentUserId, updatedStats);

            // 3. Mark completed locally
            await LocalDatabaseService.markSyncComplete(item.id, match.id);
            synced += 1;
          }
        } catch (error: any) {
          failed += 1;
          await LocalDatabaseService.markSyncFailed(item.id, error?.message || 'Sync failed');
        }
      }
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { synced, failed };
  }

  public static addSyncListener(
    listener: (isSyncing: boolean, pendingCount: number) => void
  ): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private static notifyListeners(): void {
    LocalDatabaseService.getPendingSyncQueue()
      .then((items) => {
        this.syncListeners.forEach((l) => l(this.isSyncing, items.length));
      })
      .catch(() => {});
  }
}

