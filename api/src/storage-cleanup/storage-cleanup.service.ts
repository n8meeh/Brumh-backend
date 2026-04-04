import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import * as admin from 'firebase-admin';

const BUCKET_NAME = 'vrum-app-4f563.firebasestorage.app';

// Minimum age (ms) a file must have before being considered for deletion.
// 24 hours prevents removing files being uploaded at cleanup time.
const MIN_AGE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class StorageCleanupService {
  private readonly logger = new Logger(StorageCleanupService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Runs every day at 03:00 AM (server time).
   * Deletes Firebase Storage files that are not referenced in the database
   * and are older than 24 hours.
   */
  @Cron('0 3 * * *', { name: 'storage-cleanup' })
  async handleStorageCleanup(): Promise<void> {
    this.logger.log('🔄 Starting Firebase Storage orphan cleanup...');

    try {
      const referencedPaths = await this.getAllReferencedPaths();
      this.logger.log(`📦 Found ${referencedPaths.size} referenced file paths in DB.`);

      const bucket = admin.storage().bucket(BUCKET_NAME);
      const [files] = await bucket.getFiles();
      this.logger.log(`☁️  Found ${files.length} files in Firebase Storage.`);

      const now = Date.now();
      let deletedCount = 0;
      let skippedCount = 0;

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const timeCreated = new Date(metadata.timeCreated as string).getTime();
        const ageMs = now - timeCreated;

        // Skip files newer than 24 hours
        if (ageMs < MIN_AGE_MS) {
          skippedCount++;
          continue;
        }

        const filePath = file.name; // e.g. "posts/images/1750000000000_abc.jpg"

        if (!referencedPaths.has(filePath)) {
          try {
            await file.delete();
            this.logger.log(`🗑️  Deleted orphan: ${filePath}`);
            deletedCount++;
          } catch (deleteErr) {
            this.logger.error(`❌ Failed to delete ${filePath}:`, deleteErr);
          }
        }
      }

      this.logger.log(
        `✅ Cleanup complete. Deleted: ${deletedCount} | Skipped (too new): ${skippedCount} | Referenced: ${files.length - deletedCount - skippedCount}`,
      );
    } catch (err) {
      this.logger.error('❌ Storage cleanup failed:', err);
    }
  }

  /**
   * Builds a Set of all file paths currently referenced in the database.
   * Handles both plain-string URL columns and JSON-array URL columns.
   */
  private async getAllReferencedPaths(): Promise<Set<string>> {
    const paths = new Set<string>();

    // ── Plain varchar URL columns ──────────────────────────────────────────
    const plainUrlQueries: string[] = [
      'SELECT avatar_url AS url FROM users WHERE avatar_url IS NOT NULL',
      'SELECT logo_url   AS url FROM providers WHERE logo_url IS NOT NULL',
      'SELECT cover_url  AS url FROM providers WHERE cover_url IS NOT NULL',
      'SELECT image_url  AS url FROM provider_products WHERE image_url IS NOT NULL',
      'SELECT image_url  AS url FROM groups WHERE image_url IS NOT NULL',
      'SELECT image_url  AS url FROM native_ads WHERE image_url IS NOT NULL',
      'SELECT photo_url  AS url FROM vehicles WHERE photo_url IS NOT NULL',
      'SELECT attachment_url AS url FROM vehicle_events WHERE attachment_url IS NOT NULL',
    ];

    for (const query of plainUrlQueries) {
      const rows: { url: string }[] = await this.dataSource.query(query);
      for (const row of rows) {
        const normalized = this.extractFilePath(row.url);
        if (normalized) paths.add(normalized);
      }
    }

    // ── JSON array URL columns ─────────────────────────────────────────────
    const jsonUrlQueries: string[] = [
      'SELECT media_url         AS json_val FROM posts     WHERE media_url         IS NOT NULL',
      'SELECT identity_docs_url AS json_val FROM providers WHERE identity_docs_url IS NOT NULL',
    ];

    for (const query of jsonUrlQueries) {
      const rows: { json_val: string | string[] }[] = await this.dataSource.query(query);
      for (const row of rows) {
        try {
          const arr: unknown[] =
            Array.isArray(row.json_val)
              ? row.json_val
              : JSON.parse(row.json_val as string);

          for (const item of arr) {
            if (typeof item === 'string') {
              const normalized = this.extractFilePath(item);
              if (normalized) paths.add(normalized);
            }
          }
        } catch {
          // Malformed JSON in DB row — skip silently
        }
      }
    }

    return paths;
  }

  /**
   * Extracts the bucket-relative file path from any Firebase Storage URL format.
   *
   * Supported formats:
   *   1. https://storage.googleapis.com/{bucket}/{path}
   *   2. https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
   *
   * Returns null if the URL does not belong to this bucket.
   */
  private extractFilePath(url: string): string | null {
    if (!url) return null;

    try {
      // Format 1: public storage CDN URL
      const prefix1 = `https://storage.googleapis.com/${BUCKET_NAME}/`;
      if (url.startsWith(prefix1)) {
        return url.slice(prefix1.length).split('?')[0];
      }

      // Format 2: firebasestorage download URL
      const prefix2 = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/`;
      if (url.startsWith(prefix2)) {
        const encodedPath = url.slice(prefix2.length).split('?')[0];
        return decodeURIComponent(encodedPath);
      }

      return null; // URL belongs to a different service — ignore
    } catch {
      return null;
    }
  }
}
