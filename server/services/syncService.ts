import { suiteCRMService } from './suitecrm';
import { query } from '../database';

interface SyncRecord {
  id: number;
  direction: 'local_to_crm' | 'crm_to_local';
  entity_type: string;
  entity_id: number;
  status: 'pending' | 'success' | 'failed' | 'dead_letter';
  attempts: number;
  error?: string;
  last_attempt: Date;
  checksum?: string;
}

export class SyncService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly BATCH_SIZE = 10;
  private readonly DEAD_LETTER_THRESHOLD = 5;

  async syncConsultationToCRM(consultationId: number): Promise<void> {
    console.log(`Starting sync process for consultation ID: ${consultationId}`);

    try {
      // Get consultation data
      const consultations = await this.getConsultationData(consultationId);
      if (!consultations?.length) {
        throw new Error(`Consultation not found: ${consultationId}`);
      }

      const consultation = consultations[0];
      this.validateConsultationData(consultation);
      await this.validateAndCreateSyncRecord(consultationId, consultation);

      // Attempt sync with improved error context
      const result = await suiteCRMService.createConsultationMeeting({
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        notes: consultation.notes,
        preferredDate: consultation.preferred_date,
        preferredTime: consultation.preferred_time
      });

      await this.handleSyncResult(consultationId, result);

    } catch (error) {
      await this.handleSyncError(consultationId, error);
      throw error;
    }
  }

  private validateConsultationData(consultation: any) {
    if (!consultation.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!consultation.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!consultation.phone?.trim()) {
      throw new Error('Phone is required');
    }

    // Validate time format if provided
    if (consultation.preferred_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(consultation.preferred_time)) {
        throw new Error('Invalid time format. Expected HH:mm');
      }
    }

    // Validate date format if provided
    if (consultation.preferred_date) {
      const date = new Date(consultation.preferred_date);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
    }
  }

  private async getConsultationData(consultationId: number) {
    const result = await query<any[]>(
      `SELECT 
        id, name, email, phone, notes,
        preferred_date,
        TO_CHAR(preferred_time, 'HH24:MI') as preferred_time,
        MD5(CONCAT(
          name, 
          email, 
          phone, 
          COALESCE(notes, ''), 
          COALESCE(preferred_date::text, ''),
          COALESCE(preferred_time::text, '')
        )) as checksum
      FROM consultations 
      WHERE id = $1`,
      [consultationId]
    );

    console.log('Retrieved consultation data:', {
      id: result[0]?.id,
      name: result[0]?.name,
      preferred_date: result[0]?.preferred_date,
      preferred_time: result[0]?.preferred_time
    });

    return result;
  }

  private async validateAndCreateSyncRecord(consultationId: number, consultation: any) {
    await this.createSyncRecord({
      direction: 'local_to_crm',
      entity_type: 'consultation',
      entity_id: consultationId,
      checksum: consultation.checksum
    });
  }

  private async handleSyncResult(consultationId: number, result: any) {
    if (result.success) {
      await this.updateSyncStatus(consultationId, 'local_to_crm', 'success');
      await this.updateConsultationSyncStatus(consultationId, 'synced');
    } else {
      throw new Error(result.message || 'Unknown sync error');
    }
  }

  private async handleSyncError(consultationId: number, error: any) {
    console.error(`Failed to sync consultation ${consultationId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const syncRecord = await this.getSyncRecord(consultationId);
    if (syncRecord && syncRecord.attempts >= this.DEAD_LETTER_THRESHOLD) {
      await this.moveToDeadLetterQueue(consultationId, errorMessage);
    } else {
      await this.updateSyncStatus(consultationId, 'local_to_crm', 'failed', errorMessage);
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

    console.error(`Record moved to dead letter queue:`, {
      entityId,
      error,
      timestamp: new Date().toISOString()
    });
  }

  private async createSyncRecord({
    direction,
    entity_type,
    entity_id,
    checksum
  }: {
    direction: 'local_to_crm' | 'crm_to_local';
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
    direction: 'local_to_crm' | 'crm_to_local',
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
}

export const syncService = new SyncService();