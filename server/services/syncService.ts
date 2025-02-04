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
  last_sync_timestamp?: string;
}

export class SyncService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly BATCH_SIZE = 10;

  async syncConsultationToCRM(consultationId: number): Promise<void> {
    try {
      console.log(`Starting sync process for consultation ID: ${consultationId}`);

      // Get consultation data from PostgreSQL
      const consultations = await query<any[]>(
        `SELECT * FROM consultations WHERE id = $1`,
        [consultationId]
      );

      if (!consultations || consultations.length === 0) {
        throw new Error(`Consultation not found: ${consultationId}`);
      }

      const consultation = consultations[0];
      console.log('Retrieved consultation data:', {
        id: consultation.id,
        email: consultation.email,
        name: consultation.name,
        // Exclude sensitive data from logs
      });

      // Create sync record
      await this.createSyncRecord({
        direction: 'mysql_to_crm',
        entity_type: 'consultation',
        entity_id: consultationId
      });

      console.log('Created sync record, attempting CRM sync...');

      // Attempt to sync with CRM
      const result = await suiteCRMService.createContact({
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        notes: consultation.notes,
        preferredDate: consultation.preferred_date?.toISOString(),
        preferredTime: consultation.preferred_time
      });

      console.log('CRM sync attempt result:', {
        success: result.success,
        message: result.message
      });

      // Update sync status
      if (result.success) {
        console.log(`Successfully synced consultation ${consultationId} to CRM`);
        await this.updateSyncStatus(consultationId, 'mysql_to_crm', 'success');
        await this.updateConsultationSyncStatus(consultationId, 'synced');
      } else {
        throw new Error(result.message || 'Unknown sync error');
      }
    } catch (error) {
      console.error(`Failed to sync consultation ${consultationId} to CRM:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.updateSyncStatus(
        consultationId,
        'mysql_to_crm',
        'failed',
        errorMessage
      );

      await this.updateConsultationSyncStatus(
        consultationId, 
        'failed', 
        errorMessage
      );

      // Re-throw the error to ensure proper error handling up the chain
      throw error;
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
      `INSERT INTO sync_records 
       (direction, entity_type, entity_id, status, attempts, last_attempt)
       VALUES ($1, $2, $3, 'pending', 0, NOW())`,
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
}

export const syncService = new SyncService();