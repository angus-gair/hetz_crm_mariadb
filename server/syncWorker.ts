import { syncService } from './services/syncService';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function processSyncs() {
  try {
    await syncService.processPendingSyncs();
  } catch (error) {
    console.error('Error processing syncs:', error);
  } finally {
    // Schedule next sync
    setTimeout(processSyncs, SYNC_INTERVAL);
  }
}

// Start the sync worker
console.log('Starting sync worker...');
processSyncs().catch(console.error);
