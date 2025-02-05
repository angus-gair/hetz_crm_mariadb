# SuiteCRM Integration Guide

## 1. LanguageManager Error Analysis

### Error Details
```
Fatal error: Cannot declare class LanguageManager, because the name is already in use in 
/var/www/html/public/legacy/include/SugarObjects/LanguageManager.php on line 50
```

### Root Cause
This error occurs when the LanguageManager class is being declared multiple times, typically due to:
1. Duplicate class declarations in the SuiteCRM codebase
2. Cache conflicts in the PHP opcode cache
3. Autoloader conflicts with legacy code

### Server-side Fix Steps

1. Clear SuiteCRM Cache:
```bash
# Remove SuiteCRM cache files
rm -rf /var/www/html/public/cache/*
rm -rf /var/www/html/public/custom/cache/*

# Clear PHP opcache
php -r 'opcache_reset();'
```

2. Fix File Permissions:
```bash
chown -R www-data:www-data /var/www/html/public/cache
chmod -R 755 /var/www/html/public/cache
```

3. Repair SuiteCRM:
- Navigate to Admin → Repair
- Run "Quick Repair and Rebuild"
- Clear browser cache after repair

4. Check for Class Conflicts:
```bash
grep -r "class LanguageManager" /var/www/html/public/
```

## 2. Database Sync Strategy

### Current Architecture
- Source: PostgreSQL (Our Application)
- Target: MySQL (SuiteCRM)
- Sync Type: Bi-directional with conflict resolution

### Recommended Approach

1. **Event-Based Real-time Sync**
   - Use database triggers to capture changes
   - Queue changes for processing
   - Use SuiteCRM's REST API for data integrity
   - Implement dead letter queue for failed syncs

2. **Change Tracking**
   - Use checksums for detecting changes
   - Track sync status and attempts
   - Implement retry mechanism with exponential backoff

3. **Error Handling**
   - Log all sync attempts
   - Move failed records to dead letter queue after MAX_ATTEMPTS
   - Implement notification system for failures

### Implementation Details

1. **Database Structure**
```sql
-- Already implemented in sync_records table
ALTER TABLE sync_records 
ADD COLUMN checksum VARCHAR(32),
ADD COLUMN status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN attempts INTEGER DEFAULT 0,
ADD COLUMN last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

2. **Sync Process Flow**
```
[PostgreSQL Event] → [Queue] → [Sync Service] → [SuiteCRM API]
                              ↳ [Dead Letter Queue] (if failed)
```

3. **Error Recovery**
- Automatic retry for temporary failures
- Manual intervention for dead letter queue
- Checksum validation for data integrity

### Best Practices

1. **Data Integrity**
   - Use transactions for atomic operations
   - Implement checksums for verification
   - Maintain audit logs

2. **Performance**
   - Batch similar operations
   - Use connection pooling
   - Implement caching where appropriate

3. **Monitoring**
   - Track sync statistics
   - Monitor error rates
   - Set up alerts for repeated failures

### Current Implementation Status
- ✅ Basic sync functionality
- ✅ Error handling with retries
- ✅ Dead letter queue
- ✅ Checksum tracking
- ✅ Bi-directional sync support
