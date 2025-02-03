import { suiteCRMService } from './suitecrm';
import { query } from '../database';

interface SyncRecord {
  id: number;
  direction: 'mysql_to_crm' | 'crm_to_mysql';
  entity_type: string;
  entity_id: number;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  error?: string;
  last_attempt: Date;
}

export class SyncService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly BATCH_SIZE = 10;

  async syncConsultationToCRM(consultationId: number): Promise<void> {
    try {
      // Get consultation data from MySQL
      const [consultation] = await query<any[]>(
        `SELECT * FROM consultations WHERE id = ?`,
        [consultationId]
      );

      if (!consultation) {
        throw new Error(`Consultation not found: ${consultationId}`);
      }

      // Create sync record
      await this.createSyncRecord({
        direction: 'mysql_to_crm',
        entity_type: 'consultation',
        entity_id: consultationId
      });

      // Attempt to sync with CRM
      const result = await suiteCRMService.createContact({
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        notes: consultation.notes,
        preferredDate: consultation.preferred_date?.toISOString(),
        preferredTime: consultation.preferred_time
      });

      // Update sync status
      if (result.success) {
        await this.updateSyncStatus(consultationId, 'mysql_to_crm', 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`Failed to sync consultation ${consultationId} to CRM:`, error);
      await this.updateSyncStatus(
        consultationId,
        'mysql_to_crm',
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async createSyncRecord({
    direction,
    entity_type,
    entity_id
  }: {
    direction: 'mysql_to_crm' | 'crm_to_mysql';
    entity_type: string;
    entity_id: number;
  }): Promise<void> {
    await query(
      `INSERT INTO sync_records (
        direction, entity_type, entity_id, status, attempts, last_attempt
      ) VALUES (?, ?, ?, 'pending', 0, NOW())`,
      [direction, entity_type, entity_id]
    );
  }

  private async updateSyncStatus(
    entityId: number,
    direction: 'mysql_to_crm' | 'crm_to_mysql',
    status: 'success' | 'failed',
    error?: string
  ): Promise<void> {
    await query(
      `UPDATE sync_records 
       SET status = ?, 
           attempts = attempts + 1,
           error = ?,
           last_attempt = NOW()
       WHERE entity_id = ? AND direction = ?`,
      [status, error || null, entityId, direction]
    );
  }

  async processPendingSyncs(): Promise<void> {
    try {
      // Get pending sync records that haven't exceeded max attempts
      const pendingSyncs = await query<SyncRecord[]>(
        `SELECT * FROM sync_records 
         WHERE status != 'success' 
         AND attempts < ? 
         ORDER BY last_attempt ASC 
         LIMIT ?`,
        [this.MAX_ATTEMPTS, this.BATCH_SIZE]
      );

      for (const sync of pendingSyncs) {
        if (sync.entity_type === 'consultation') {
          await this.syncConsultationToCRM(sync.entity_id);
        }
      }
    } catch (error) {
      console.error('Failed to process pending syncs:', error);
    }
  }
}

export const syncService = new SyncService();
