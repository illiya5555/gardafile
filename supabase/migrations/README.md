/*
# Database Migration Guide

This document outlines the database migration process for optimizing the Garda Racing Yacht Club database structure.

## Migration Overview

The migration consolidates multiple tables into a more efficient structure:

1. **User Data**: Combines `profiles`, `unified_customers`, and `stripe_customers` into a single `users_core` table
2. **Bookings**: Unifies `reservations` and `yacht_bookings` into a single `bookings` table
3. **Payments**: Combines `stripe_orders` and `stripe_subscriptions` into a single `payments` table
4. **Inquiries**: Standardizes the `unified_inquiries` table

## Migration Files

The migration is split into multiple files for better organization:

1. `migrate_user_data.sql` - Creates and populates the `users_core` table
2. `create_payments_table.sql` - Creates and populates the `payments` table
3. `create_bookings_table.sql` - Creates and populates the `bookings` table
4. `create_migration_procedure.sql` - Creates a procedure to safely execute the migration
5. `create_booking_stats_view.sql` - Creates views for booking statistics
6. `create_user_stats_function.sql` - Creates functions to update user statistics
7. `cleanup_after_migration.sql` - Safely removes old tables after migration
8. `create_optimization_functions.sql` - Creates functions for database optimization
9. `create_monitoring_view.sql` - Creates views for database monitoring
10. `create_maintenance_schedule.sql` - Sets up automated database maintenance

## Migration Process

### 1. Preparation

Before running the migration, ensure you have:

- Created a backup of the database
- Tested the migration in a development environment
- Scheduled downtime if necessary

### 2. Running the Migration

The migration can be run using the `migrate_database()` procedure:

```sql
CALL migrate_database();
```

This procedure will:
- Create the new table structure
- Migrate data from old tables to new tables
- Verify data integrity
- Create compatibility views for backward compatibility

### 3. Verification

After migration, verify that:

- All data has been successfully migrated
- Applications can connect to and use the new structure
- Performance has improved

### 4. Cleanup

Once the migration is verified, run the cleanup procedure:

```sql
CALL cleanup_after_migration();
```

This will remove the old tables and finalize the migration.

## Database Optimization

The migration includes several optimization features:

### Performance Analysis

```sql
-- Analyze table statistics
SELECT * FROM analyze_table_statistics();

-- Analyze index usage
SELECT * FROM analyze_index_usage();

-- Identify missing indexes
SELECT * FROM identify_missing_indexes();

-- Get database health summary
SELECT * FROM get_database_health_summary();
```

### Maintenance

```sql
-- Run optimization
CALL optimize_database();

-- Run scheduled maintenance
CALL run_maintenance('daily');
CALL run_maintenance('weekly');
CALL run_maintenance('monthly');
```

## Compatibility

For backward compatibility, the migration creates views that map to the new structure:

- `profiles_view` → `users_core`
- `reservations_view` → `bookings` (where booking_type = 'sailing')
- `yacht_bookings_view` → `bookings` (where booking_type = 'yacht')
- `stripe_orders_view` → `payments` (where payment_type = 'order')
- `stripe_subscriptions_view` → `payments` (where payment_type = 'subscription')

These views allow existing code to continue working without immediate changes.

## Troubleshooting

If you encounter issues during migration:

1. Check the PostgreSQL logs for detailed error messages
2. Verify that all required tables exist
3. Ensure there are no active transactions blocking the migration
4. If necessary, run `CALL migrate_database()` with debug logging enabled

For assistance, contact the database administrator.
*/

-- This is a documentation file, not an actual migration
-- The actual migration is split across multiple files
SELECT 'Documentation file - no actual migration' AS message;