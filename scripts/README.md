# Strapi Utility Scripts

This directory contains maintenance and migration scripts for the ZRI Adventures Strapi backend.

## 📜 Available Scripts

### 1. `test-voucher-lifecycle.js`

**Purpose:** Test voucher draft/publish flow and couponCode uniqueness validation.

**When to use:**

- After fixing voucher lifecycle bugs
- To verify draft/publish behavior in Strapi v5
- To test couponCode uniqueness across draft and published versions

**Usage:**

```bash
npm run strapi -- scripts/test-voucher-lifecycle.js
```

**What it tests:**

- ✅ Create draft voucher with couponCode
- ✅ Publish draft voucher (should succeed without "coupon code exists" error)
- ✅ Verify draft and published versions coexist with same documentId
- ✅ Reject duplicate couponCode from different documents
- ✅ Test couponCode immutability (prevent changes after creation)
- ✅ Create and publish new voucher with different couponCode

**Expected output:**

```
🧪 Starting Voucher Lifecycle Tests

✅ PASS: Create draft voucher
✅ PASS: Publish draft voucher
✅ PASS: Draft and published coexist
✅ PASS: Duplicate couponCode validation
✅ PASS: Create and publish new voucher
✅ PASS: CouponCode immutability

📊 TEST SUMMARY
Total Tests: 6
Passed: 6 ✅
Failed: 0 ❌
```

### 2. `backfill-computed-fields.js`

**Purpose:** Populate computed fields (including `minPrice*` and duration fields) for all existing records.

**When to use:**

- After adding new computed fields to schemas
- After importing/migrating data
- When computed fields are empty/null

**Usage:**

```bash
# Stop Strapi dev server first!
node scripts/backfill-computed-fields.js
```

**What it does:**

- ✅ Computes minimum prices (USD/LKR) for Experiences, Tours, Merchandise
- ✅ Computes duration buckets for Experiences and Tours
- ✅ Processes all records in batches
- ✅ Shows progress updates
- ✅ Provides summary report

**Expected output:**

```
🚀 Starting backfill process...
✅ Strapi loaded successfully

📦 Processing Experiences...
   Found 300 experiences
   Updated 50 experiences...
   Updated 100 experiences...
✅ Updated 300 experiences

📦 Processing Tours...
   Found 2 tours
✅ Updated 2 tours

📦 Processing Merchandise...
   Found 50 merchandise items
✅ Updated 50 merchandise items

🎉 Backfill complete!
```

**Runtime:** ~30-60 seconds for 300 records

---

### 2.1 `backfill-experience-duration.js`

**Purpose:** Populate `minDuration` for all experiences.

**Usage:**

```bash
node scripts/backfill-experience-duration.js
node scripts/backfill-experience-duration.js --dry-run
```

**Output summary:**

```
[backfill-experience-duration] scanned=320 updated=210 skipped=109 failed=1
```

---

### 2. `add-filter-indexes.js`

**Purpose:** Add database indexes for optimized filtering queries.

**When to use:**

- After running backfill script
- When experiencing slow filter queries
- On fresh database setup

**Usage:**

```bash
# Can run while Strapi is running (but better to stop it)
node scripts/add-filter-indexes.js
```

**What it does:**

- ✅ Adds single-column indexes for price fields
- ✅ Adds indexes for duration fields
- ✅ Adds composite indexes for combined filters
- ✅ Idempotent (safe to run multiple times)

**Expected output:**

```
🔧 Adding database indexes...
✅ Connected to database

📊 Adding indexes to experiences table...
✅ Experiences indexes added

📊 Adding indexes to tours table...
✅ Tours indexes added

📊 Adding indexes to merchandises table...
✅ Merchandise indexes added

🎉 All indexes added successfully!
```

**Runtime:** ~5-10 seconds

**Indexes created:**

```sql
-- Experiences (5 indexes)
idx_experiences_min_price_usd
idx_experiences_min_price_lkr
idx_experiences_min_duration_hours
idx_experiences_duration_bucket
idx_experiences_price_usd_duration (composite)
idx_experiences_price_lkr_duration (composite)

-- Tours (6 indexes)
idx_tours_min_price_usd
idx_tours_min_price_lkr
idx_tours_duration_bucket
idx_tours_duration_days
idx_tours_price_usd_duration (composite)
idx_tours_price_lkr_duration (composite)

-- Merchandise (2 indexes)
idx_merchandises_min_price_usd
idx_merchandises_min_price_lkr
```

---

### 3. `migrate-voucher-templates.js` (Existing)

**Purpose:** Migrate voucher template data.

**Status:** Pre-existing script

---

## 🔄 Typical Workflow

### Initial Setup (New Database)

```bash
# 1. Start Strapi to create tables
npm run develop

# 2. Stop Strapi (Ctrl+C)

# 3. Run backfill
node scripts/backfill-computed-fields.js

# 4. Add indexes
node scripts/add-filter-indexes.js

# 5. Restart Strapi
npm run develop
```

### After Schema Changes

```bash
# 1. Restart Strapi to apply schema changes
npm run develop

# 2. Stop Strapi

# 3. Run backfill to populate new fields
node scripts/backfill-computed-fields.js

# 4. Restart Strapi
npm run develop
```

### After Data Import

```bash
# Stop Strapi, then:
node scripts/backfill-computed-fields.js
node scripts/add-filter-indexes.js
# Restart Strapi
```

---

## ⚠️ Important Notes

### Before Running Scripts

1. **Stop Strapi:** Scripts need exclusive database access

   ```bash
   # Press Ctrl+C in terminal running Strapi
   ```

2. **Backup Database:** Always backup before major operations

   ```bash
   # PostgreSQL
   pg_dump dbname > backup.sql

   # MySQL
   mysqldump dbname > backup.sql
   ```

3. **Check Database Connection:** Ensure `config/database.js` is correct

### Script Failures

**Backfill fails with "Cannot connect":**

- Ensure Strapi is stopped
- Check database credentials in `config/database.js`
- Verify database is running

**Index script shows "already exists":**

- This is normal - script is idempotent
- Ignore these warnings

**Script hangs indefinitely:**

- Check database connection
- Verify no other processes are holding locks
- Restart database server if needed

---

## 🧪 Testing Scripts Locally

### Dry Run (Recommended)

Before running on production, test on a development database:

```bash
# 1. Copy production database to dev
# 2. Update database.js to point to dev database
# 3. Run scripts on dev database
# 4. Verify results
# 5. Switch back to production database
# 6. Run on production
```

### Verify Results

After running backfill:

```bash
# PostgreSQL
psql dbname -c "SELECT COUNT(*) FROM experiences WHERE min_price_usd IS NOT NULL;"

# MySQL
mysql dbname -e "SELECT COUNT(*) FROM experiences WHERE min_price_usd IS NOT NULL;"
```

Expected: Should match total experience count.

---

## 📊 Performance Impact

### Backfill Script

- **CPU:** Moderate (50-70% during execution)
- **Memory:** Low (~100-200 MB)
- **Disk I/O:** Moderate (writes to all records)
- **Lock Time:** Brief per-record write lock
- **Network:** None (local database operations)

### Index Script

- **CPU:** High during index build (80-90%)
- **Memory:** Moderate (depends on table size)
- **Disk I/O:** High during index creation
- **Lock Time:** Brief metadata lock
- **Storage:** +0.5-1 MB per index

---

## 🔒 Production Considerations

### Deployment Window

**Recommended:** Run during low-traffic periods

- **Backfill:** 1-2 minutes for 300 records
- **Indexes:** 10-20 seconds
- **Total downtime:** < 3 minutes

### Monitoring

After running scripts in production:

1. **Check logs:** Verify no errors
2. **Test queries:** Ensure filters work
3. **Monitor performance:** Compare before/after query times
4. **Check database size:** Should increase by ~1-2 MB
5. **Verify functionality:** Test frontend filters

### Rollback

If something goes wrong:

```bash
# 1. Restore from backup
pg_restore backup.sql # PostgreSQL
mysql dbname < backup.sql # MySQL

# 2. Restart Strapi
npm run develop

# 3. Investigate issue
# 4. Fix and retry
```

---

## 📚 Additional Resources

- **Strapi Docs:** https://docs.strapi.io
- **Database Indexing:** See IMPLEMENTATION_GUIDE.md
- **Troubleshooting:** See QUICK_START.md

---

## 🆘 Support

If scripts fail or produce unexpected results:

1. Check console output for error messages
2. Review IMPLEMENTATION_GUIDE.md troubleshooting section
3. Verify Strapi version compatibility (v4.x)
4. Check database server logs
5. Ensure sufficient disk space and permissions

---

**Last Updated:** January 17, 2026  
**Strapi Version:** 4.x  
**Tested On:** PostgreSQL 14+, MySQL 8+
