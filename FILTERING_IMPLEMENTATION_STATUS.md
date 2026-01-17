# Server-Side Filtering Implementation Status

## Current Status: Backend Not Functional ❌

### What Was Attempted

We attempted to implement server-side price and duration filtering for Experiences, Tours, and Merchandise by adding computed fields to store:

- `minPriceUSD` / `minPriceLKR` - Minimum prices for filtering
- `minDurationHours` - Minimum duration for bucket calculation
- `durationBucket` - Pre-computed duration categories (enums)

### Why It Failed

**Strapi v5's Document Service API with draft/publish system prevents lifecycle hooks from persisting computed field values.**

Multiple approaches were tried:

1. ✗ `beforeCreate`/`beforeUpdate` hooks - Values computed but not persisted
2. ✗ `afterUpdate` with direct SQL updates - Caused infinite loops
3. ✗ Manual backfill scripts - Executed successfully but database remains NULL
4. ✗ Document re-publishing - Triggered recursive updates, had to force-stop

### What Was Cleaned Up

#### Removed Files:

- `scripts/backfill-computed-fields.js` (non-functional)
- `scripts/backfill-direct-sql.js` (non-functional)
- `scripts/trigger-lifecycle-hooks.js` (caused infinite loops)
- `scripts/check-db-direct.js` (diagnostic only)

#### Kept Files:

- `scripts/add-filter-indexes.js` - Database indexes successfully created (13 indexes)
- `scripts/verify-computed-fields.js` - Verification tool (confirms all fields are NULL)
- `scripts/migrate-voucher-templates.js` - Unrelated, pre-existing script

#### Cleaned Lifecycle Files:

All lifecycle hooks removed from:

- `src/api/experience/content-types/experience/lifecycles.js` (was 228 lines, now minimal)
- `src/api/tour/content-types/tour/lifecycles.js` (was 161 lines, now minimal)
- `src/api/merchandise/content-types/merchandise/lifecycles.js` (was 148 lines, now minimal)

Each file now contains only an empty module export with comments explaining why.

### What Still Works

#### Schema Fields (Keep These):

The schema definitions remain in place and are correct:

- `experience/schema.json` - Has minPriceUSD, minPriceLKR, minDurationHours, durationBucket
- `tour/schema.json` - Has minPriceUSD, minPriceLKR, durationBucket
- `merchandise/schema.json` - Has minPriceUSD, minPriceLKR

#### Database Indexes (Working):

13 indexes successfully created for optimized filtering:

- Price range indexes (minPriceUSD, minPriceLKR)
- Duration indexes (minDurationHours, durationBucket)

#### Frontend (Fully Implemented):

All frontend code is complete and working:

- Filter hooks: `useFilteredExperiences.ts`, `useFilteredTours.ts`
- UI components: `ExperienceFilters.tsx`, `TourFilters.tsx`
- State management: `ExperienceStore.tsx`, `TourStore.tsx`
- Zod schemas: All updated with computed fields
- Currency-aware ranges: USD (0-2000) and LKR (0-500000)

### Database Status

**All 267 records have NULL values for computed fields:**

- 236 Experiences - All NULL
- 4 Tours - All NULL
- 27 Merchandise - All NULL

---

## Alternative Solutions

You must choose one of these approaches to make filtering work:

### Option 1: Client-Side Computation (Fastest)

**Compute min prices/durations when data is fetched in frontend**

✅ Pros:

- Works immediately with existing frontend code
- No Strapi changes needed
- Simple to implement

❌ Cons:

- Violates original "Frontend must NOT compute" requirement
- Computation happens on every page load
- May impact performance with large datasets

**Implementation**: Add computation logic to frontend query hooks.

### Option 2: Custom Admin Endpoint (Manual)

**Create a Strapi admin panel button to manually backfill computed fields**

✅ Pros:

- Works with Strapi v5 architecture
- One-time execution, values persist
- Admin has control over when to run

❌ Cons:

- Manual process required after content updates
- Requires admin to remember to trigger updates
- Won't update automatically on content changes

**Implementation**: Create custom Strapi controller with endpoint `/admin/backfill-computed-fields`.

### Option 3: Scheduled Cron Job (Automated)

**Periodic background job to recompute values**

✅ Pros:

- Automated, no manual intervention
- Values eventually consistent
- Works with Strapi v5

❌ Cons:

- Values potentially stale between runs
- Additional infrastructure (cron service)
- More complex architecture

**Implementation**: External service or Strapi cron plugin hitting custom endpoint.

### Option 4: PostgreSQL Views/Triggers (Database-Level)

**Compute values directly in PostgreSQL**

✅ Pros:

- Always accurate, computed on read
- No application code changes
- Database-native solution

❌ Cons:

- Most complex implementation
- Requires direct database access
- Harder to maintain
- May not work with Strapi's query system

**Implementation**: Create PostgreSQL computed columns or materialized views.

---

## Recommended Next Steps

1. **Decide on approach** - Choose from options above based on requirements
2. **If Option 1 (Client-Side)**:
   - Add computation functions to `useFilteredExperiences.ts` and `useFilteredTours.ts`
   - Compute on data fetch, cache results
3. **If Option 2 (Admin Endpoint)**:
   - Create custom controller in `src/api/admin/controllers/`
   - Add button to Strapi admin UI
   - Use Document Service API to update published documents
4. **If Option 3 (Cron)**:
   - Implement Option 2 first
   - Add external cron service or use Strapi cron plugin
   - Schedule periodic execution
5. **If Option 4 (Database)**:
   - Work with DBA to create PostgreSQL computed columns
   - Test with Strapi query system
   - May require custom SQL for filtering

---

## Technical Details

### Strapi v5 Enum Constraints

Enums must start with alphabetical characters (not numbers):

**Experiences Duration Buckets:**

- `under_one_hour` - < 1 hour
- `two_to_four_hours` - 2-4 hours
- `four_to_ten_hours` - 4-10 hours
- `overnight` - > 10 hours

**Tours Duration Buckets:**

- `under_one_day` - < 2 days
- `three_days` - 3 days exactly
- `five_days` - 4-6 days
- `one_week_plus` - 7+ days

### Currency Ranges

- **USD**: 0 - 2000 (suitable for international tourists)
- **LKR**: 0 - 500000 (local currency equivalent)

---

## Files to Review

If implementing a solution, refer to:

- Frontend: `zriadventures-dev/lib/query/useFilteredExperiences.ts`
- Schemas: `zriadventures-strapi/src/api/experience/content-types/experience/schema.json`
- Verification: `zriadventures-strapi/scripts/verify-computed-fields.js`
