# SuiteCRM LanguageManager Error Analysis

## Error Details
- **Error Type**: Fatal PHP Error
- **Error Message**: Cannot declare class LanguageManager
- **File Location**: /var/www/html/public/legacy/include/SugarObjects/LanguageManager.php
- **Line Number**: 50

## Root Cause
The error occurs because the LanguageManager class is being declared multiple times in the SuiteCRM codebase. This typically happens due to:
1. Multiple include/require statements loading the same class
2. Cache files containing duplicate class declarations
3. Autoloader conflicts in the legacy code

## Recommended Fixes

### 1. Clear SuiteCRM Cache
```bash
# Remove cache files
rm -rf /var/www/html/public/cache/*

# Clear temporary files
rm -rf /var/www/html/public/tmp/*

# Fix permissions
chown -R www-data:www-data /var/www/html/public/cache
chown -R www-data:www-data /var/www/html/public/tmp
```

### 2. Check for Class Declarations
1. Search for multiple declarations:
```bash
grep -r "class LanguageManager" /var/www/html/public/
```

2. Check include paths:
```php
// Add to index.php temporarily for debugging
echo "<pre>";
print_r(get_included_files());
echo "</pre>";
```

### 3. Repair and Rebuild
Run the SuiteCRM repair tool:
1. Navigate to Admin → Repair
2. Run "Quick Repair and Rebuild"
3. Clear browser cache and PHP opcache

# Database Synchronization Strategy

## Current Architecture
- **Source**: PostgreSQL (Our Application)
- **Target**: MySQL (SuiteCRM)
- **Sync Type**: Bi-directional with conflict resolution

## Recommended Sync Strategy

### 1. Event-Based Sync (Real-time)
- Use database triggers in PostgreSQL to capture changes
- Queue changes for processing
- Use SuiteCRM's REST API for data integrity

### 2. Batch Sync (Periodic)
- Run every 5-15 minutes for pending records
- Use checksum comparison for changed records
- Implement retry mechanism with exponential backoff

## Implementation Steps

1. **Create Change Tracking**
```sql
-- Already implemented in sync_records table
-- Add additional tracking if needed
ALTER TABLE consultations 
ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

2. **Queue Management**
- Use existing sync_records table
- Add status tracking and retry counts
- Implement dead letter queue for failed syncs

3. **API Integration**
- Use SuiteCRM's REST API for CRUD operations
- Maintain session management
- Handle rate limiting and timeouts

4. **Error Handling**
- Log all sync attempts
- Implement notification system for failures
- Store failed records for manual review

## Best Practices

1. **Data Integrity**
- Use transaction management
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
