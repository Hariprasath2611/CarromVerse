import * as SQLite from 'expo-sqlite';
import { GameResult, SyncRecord } from '@carromverse/shared-types';

export class LocalDatabaseService {
  private static dbInstance: SQLite.SQLiteDatabase | null = null;
  private static initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  public static async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (this.dbInstance) {
      return this.dbInstance;
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        const db = await SQLite.openDatabaseAsync('carromverse.db');
        await this.runMigrations(db);
        this.dbInstance = db;
        return db;
      })();
    }

    return this.initPromise;
  }

  private static async runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS local_matches (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        variant TEXT NOT NULL,
        winner_id TEXT,
        winner_name TEXT,
        winning_team_id TEXT,
        is_draw INTEGER NOT NULL,
        final_scores_json TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        total_turns INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0,
        sync_attempt_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS pending_sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        created_at TEXT NOT NULL,
        last_attempt_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_matches_completed_at ON local_matches(completed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sync_status ON pending_sync_queue(status);
    `);
  }

  public static async saveMatch(match: GameResult): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO local_matches (
        id, session_id, mode, variant, winner_id, winner_name, winning_team_id,
        is_draw, final_scores_json, duration_seconds, total_turns, started_at,
        completed_at, is_synced, sync_attempt_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        match.id,
        match.sessionId,
        match.mode,
        match.variant,
        match.winnerId || null,
        match.winnerName || null,
        match.winningTeamId || null,
        match.isDraw ? 1 : 0,
        JSON.stringify(match.finalScores),
        match.durationSeconds,
        match.totalTurns,
        match.startedAt,
        match.completedAt,
        match.isSynced ? 1 : 0,
        match.syncAttemptCount,
      ]
    );
  }

  public static async getMatchHistory(limit: number = 50): Promise<GameResult[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM local_matches ORDER BY completed_at DESC LIMIT ?`,
      [limit]
    );

    return rows.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      mode: r.mode,
      variant: r.variant,
      winnerId: r.winner_id,
      winnerName: r.winner_name,
      winningTeamId: r.winning_team_id,
      isDraw: r.is_draw === 1,
      finalScores: JSON.parse(r.final_scores_json),
      durationSeconds: r.duration_seconds,
      totalTurns: r.total_turns,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      isSynced: r.is_synced === 1,
      syncAttemptCount: r.sync_attempt_count,
    }));
  }

  public static async enqueueSyncItem(record: SyncRecord): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO pending_sync_queue (
        id, entity_type, entity_id, payload_json, status, retry_count,
        error_message, created_at, last_attempt_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.entityType,
        record.entityId,
        JSON.stringify(record.payload),
        record.status,
        record.retryCount,
        record.errorMessage || null,
        record.createdAt,
        record.lastAttemptAt || null,
      ]
    );
  }

  public static async getPendingSyncQueue(): Promise<SyncRecord[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM pending_sync_queue WHERE status IN ('pending', 'failed') AND retry_count < 5 ORDER BY created_at ASC`
    );

    return rows.map((r) => ({
      id: r.id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      payload: JSON.parse(r.payload_json),
      status: r.status,
      retryCount: r.retry_count,
      errorMessage: r.error_message,
      createdAt: r.created_at,
      lastAttemptAt: r.last_attempt_at,
    }));
  }

  public static async markSyncComplete(syncId: string, matchId?: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM pending_sync_queue WHERE id = ?`, [syncId]);

    if (matchId) {
      await db.runAsync(
        `UPDATE local_matches SET is_synced = 1 WHERE id = ?`,
        [matchId]
      );
    }
  }

  public static async markSyncFailed(syncId: string, error: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE pending_sync_queue SET
        status = 'failed',
        retry_count = retry_count + 1,
        error_message = ?,
        last_attempt_at = ?
      WHERE id = ?`,
      [error, new Date().toISOString(), syncId]
    );
  }
}

