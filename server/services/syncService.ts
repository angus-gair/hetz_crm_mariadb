import { suiteCRMService } from './suitecrm';
import { query } from '../database';

interface SyncRecord {
  id: number;
  direction: 'mysql_to_crm' | 'crm_to_mysql';
  entity_type: string;
  entity_id: number;
  status: 'pending' | 'success' | 'failed' | 'dead_letter';
  attempts: number;
  error?: string;
  last_attempt: Date;
  checksum?: string;
  last_sync_timestamp?: string;
}

// Enhanced sync service with improved error handling and monitoring
export class SyncService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly BATCH_SIZE = 10;
  private readonly DEAD_LETTER_THRESHOLD = 5;

  // Main sync method remains unchanged
  async syncConsultationToCRM(consultationId: number): Promise<void> {
    console.log(`Starting sync process for consultation ID: ${consultationId}`);

    try {
      // Get consultation data
      const consultations = await this.getConsultationData(consultationId);
      if (!consultations?.length) {
        throw new Error(`Consultation not found: ${consultationId}`);
      }

      const consultation = consultations[0];
      await this.validateAndCreateSyncRecord(consultationId, consultation);

      // Enhanced server validation
      if (!await this.validateCRMConnection()) {
        throw new Error('CRM server validation failed - check server logs for LanguageManager errors');
      }

      // Attempt sync with improved error context
      const result = await this.attemptCRMSync(consultation);
      await this.handleSyncResult(consultationId, result);

    } catch (error) {
      await this.handleSyncError(consultationId, error);
      throw error;
    }
  }

  private async getConsultationData(consultationId: number) {
    return query<any[]>(
      `SELECT *, MD5(CONCAT(name, email, phone, notes, 
         COALESCE(preferred_date::text, ''), 
         COALESCE(preferred_time, ''))) as checksum 
       FROM consultations WHERE id = $1`,
      [consultationId]
    );
  }

  private async validateAndCreateSyncRecord(consultationId: number, consultation: any) {
    // Create sync record with checksum
    await this.createSyncRecord({
      direction: 'mysql_to_crm',
      entity_type: 'consultation',
      entity_id: consultationId,
      checksum: consultation.checksum
    });
  }

  private async attemptCRMSync(consultation: any) {
    // Format the time properly if it exists
    let preferredTime = consultation.preferred_time;
    if (preferredTime) {
      // Ensure time is in HH:mm format
      preferredTime = preferredTime.replace(/^(\d{1,2}):(\d{2}).*$/, '$1:$2');
    }

    return await suiteCRMService.createContact({
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone,
      notes: consultation.notes,
      preferredDate: consultation.preferred_date?.toISOString(),
      preferredTime: preferredTime
    });
  }

  private async handleSyncResult(consultationId: number, result: any) {
    if (result.success) {
      await this.updateSyncStatus(consultationId, 'mysql_to_crm', 'success');
      await this.updateConsultationSyncStatus(consultationId, 'synced');
    } else {
      throw new Error(result.message || 'Unknown sync error');
    }
  }

  private async handleSyncError(consultationId: number, error: any) {
    console.error(`Failed to sync consultation ${consultationId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if we should move to dead letter queue
    const syncRecord = await this.getSyncRecord(consultationId);
    if (syncRecord && syncRecord.attempts >= this.DEAD_LETTER_THRESHOLD) {
      await this.moveToDeadLetterQueue(consultationId, errorMessage);
    } else {
      await this.updateSyncStatus(consultationId, 'mysql_to_crm', 'failed', errorMessage);
      await this.updateConsultationSyncStatus(consultationId, 'failed', errorMessage);
    }
  }

  private async getSyncRecord(entityId: number): Promise<SyncRecord | null> {
    const records = await query<SyncRecord[]>(
      `SELECT * FROM sync_records 
       WHERE entity_id = $1 
       ORDER BY last_attempt DESC 
       LIMIT 1`,
      [entityId]
    );
    return records[0] || null;
  }

  private async moveToDeadLetterQueue(entityId: number, error: string): Promise<void> {
    await query(
      `UPDATE sync_records 
       SET status = 'dead_letter',
           error = $1,
           last_attempt = NOW()
       WHERE entity_id = $2`,
      [error, entityId]
    );

    // Log dead letter queue entry for monitoring
    console.error(`Record moved to dead letter queue:`, {
      entityId,
      error,
      timestamp: new Date().toISOString()
    });
  }

  private async validateCRMConnection(): Promise<boolean> {
    try {
      const testResponse = await fetch(process.env.SUITECRM_URL + '/service/v4/rest.php');
      const text = await testResponse.text();

      if (text.includes('Cannot declare class LanguageManager')) {
        console.error('SuiteCRM server has LanguageManager class conflict');
        return false;
      }

      return testResponse.ok;
    } catch (error) {
      console.error('Failed to validate CRM connection:', error);
      return false;
    }
  }

  private async createSyncRecord({
    direction,
    entity_type,
    entity_id,
    checksum
  }: {
    direction: 'mysql_to_crm' | 'crm_to_mysql';
    entity_type: string;
    entity_id: number;
    checksum?: string;
  }): Promise<void> {
    await query(
      `INSERT INTO sync_records 
       (direction, entity_type, entity_id, status, attempts, last_attempt, checksum)
       VALUES ($1, $2, $3, 'pending', 0, NOW(), $4)`,
      [direction, entity_type, entity_id, checksum || null]
    );
  }

  private async updateSyncStatus(
    entityId: number,
    direction: 'mysql_to_crm' | 'crm_to_mysql',
    status: 'success' | 'failed' | 'dead_letter',
    error?: string
  ): Promise<void> {
    await query(
      `UPDATE sync_records 
       SET status = $1,
           attempts = attempts + 1,
           error = $2,
           last_attempt = NOW()
       WHERE entity_id = $3 AND direction = $4`,
      [status, error || null, entityId, direction]
    );
  }

  private async updateConsultationSyncStatus(
    consultationId: number,
    status: 'pending' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    await query(
      `UPDATE consultations 
       SET crm_sync_status = $1,
           crm_sync_attempts = crm_sync_attempts + 1,
           crm_last_sync = NOW(),
           crm_error = $2
       WHERE id = $3`,
      [status, error || null, consultationId]
    );
  }

  private async getLastSyncTimestamp(): Promise<string> {
    const result = await query<Array<{ last_sync: string }>>(
      `SELECT MAX(last_attempt) as last_sync FROM sync_records WHERE direction = 'crm_to_mysql' AND status = 'success'`
    );
    return result[0]?.last_sync || '1970-01-01T00:00:00Z';
  }

  private async updateLastSyncTimestamp(): Promise<void> {
    await query(
      `INSERT INTO sync_records 
       (direction, entity_type, entity_id, status, attempts, last_attempt)
       VALUES ('crm_to_mysql', 'sync_timestamp', 0, 'success', 1, NOW())`
    );
  }

  async processPendingSyncs(): Promise<void> {
    try {
      // Get pending sync records that haven't exceeded max attempts
      const pendingSyncs = await query<SyncRecord[]>(
        `SELECT * FROM sync_records 
         WHERE status != 'success' 
         AND attempts < $1
         ORDER BY last_attempt ASC 
         LIMIT $2`,
        [this.MAX_ATTEMPTS, this.BATCH_SIZE]
      );

      for (const sync of pendingSyncs) {
        if (sync.entity_type === 'consultation') {
          await this.syncConsultationToCRM(sync.entity_id);
        }
      }

      // Process CRM to local sync
      await this.syncFromCRM();
    } catch (error) {
      console.error('Failed to process pending syncs:', error);
    }
  }
  async syncFromCRM(): Promise<void> {
    try {
      // Get last sync timestamp
      const lastSync = await this.getLastSyncTimestamp();

      // Get updated records from CRM
      const updatedRecords = await suiteCRMService.getUpdatedContacts(lastSync);

      for (const record of updatedRecords) {
        try {
          await this.createSyncRecord({
            direction: 'crm_to_mysql',
            entity_type: 'consultation',
            entity_id: parseInt(record.id)
          });

          // Check if record exists in local database
          const existingConsultation = await query<any[]>(
            `SELECT id FROM consultations WHERE email = $1`,
            [record.email]
          );

          if (existingConsultation.length > 0) {
            // Update existing record
            await query(
              `UPDATE consultations 
               SET name = $1, phone = $2, notes = $3, 
                   crm_sync_status = 'synced', 
                   crm_last_sync = NOW()
               WHERE id = $4`,
              [record.name, record.phone, record.notes, existingConsultation[0].id]
            );
          } else {
            // Create new record
            await query(
              `INSERT INTO consultations 
               (name, email, phone, notes, crm_sync_status, crm_last_sync)
               VALUES ($1, $2, $3, $4, 'synced', NOW())`,
              [record.name, record.email, record.phone, record.notes]
            );
          }

          await this.updateSyncStatus(parseInt(record.id), 'crm_to_mysql', 'success');
        } catch (error) {
          console.error(`Failed to sync CRM record ${record.id} to local database:`, error);
          await this.updateSyncStatus(
            parseInt(record.id),
            'crm_to_mysql',
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Update last sync timestamp
      await this.updateLastSyncTimestamp();
    } catch (error) {
      console.error('Failed to sync from CRM:', error);
    }
  }
}

export const syncService = new SyncService();