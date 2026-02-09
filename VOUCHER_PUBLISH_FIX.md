# Voucher Publish Bug Fix - Documentation

## 🐛 Bug Description

**Issue:** Creating a voucher entry with `couponCode = "test-xyz"` saves as draft successfully, but when clicking **Publish** it fails with HTTP 400 error:

```
POST /content-manager/collection-types/api::voucher.voucher/actions/publish
Error: "coupon code exists"
```

**Impact:** Users cannot publish draft vouchers, blocking the normal content workflow.

---

## 🔍 Root Cause Analysis

### 1. Strapi v5 Draft/Publish Architecture

With `draftAndPublish: true` enabled in the voucher schema, Strapi v5 creates **separate database rows** for draft and published versions:

- **Draft version:** `documentId="abc123"`, `id=1`, `publishedAt=null`
- **Published version:** `documentId="abc123"`, `id=2`, `publishedAt="2026-02-09T12:00:00Z"`

Both versions share the same `documentId` but have different `id` values.

### 2. Flawed Uniqueness Check

The `beforeCreate` lifecycle hook in [lifecycles.js](./src/api/voucher/content-types/voucher/lifecycles.js) (lines 91-97) performed a uniqueness check without accounting for `documentId`:

```javascript
// ❌ BEFORE (buggy code)
const existing = await strapi.db.query("api::voucher.voucher").findOne({
  where: { couponCode: data.couponCode },
});

if (existing) {
  throw new ValidationError(`Coupon code ${data.couponCode} already exists`);
}
```

### 3. Publish Flow Problem

When publishing a draft voucher:

1. **Draft exists:** `documentId="abc"`, `couponCode="test-xyz"`, `publishedAt=null`
2. **User clicks Publish** → Strapi creates a new row (published version)
3. **`beforeCreate` runs** for the new published row
4. **Uniqueness check finds** the draft row with same `couponCode`
5. **Error thrown:** "coupon code exists" even though it's the same document

### 4. Additional Issues Found

- **beforeUpdate hook:** Didn't properly identify entries using `documentId`
- **Legacy API usage:** Using `strapi.db.query()` (v4 Entity Service) instead of `strapi.documents()` (v5 Document Service)

---

## ✅ The Fix

### Changes Made to [lifecycles.js](./src/api/voucher/content-types/voucher/lifecycles.js)

#### 1. Fixed `beforeCreate` Uniqueness Check (lines 91-110)

```javascript
// ✅ AFTER (fixed code)
if (data.couponCode) {
  const whereClause = { couponCode: data.couponCode };

  // If this is a publish operation (has documentId), exclude entries with same documentId
  // This allows draft + published versions to coexist with the same couponCode
  if (data.documentId) {
    whereClause.documentId = { $ne: data.documentId };
  }

  const existing = await strapi.db.query("api::voucher.voucher").findOne({
    where: whereClause,
  });

  if (existing) {
    throw new ValidationError(`Coupon code ${data.couponCode} already exists`);
  }
}
```

**What changed:**

- Added check for `data.documentId` to detect publish operations
- Exclude entries with same `documentId` from uniqueness validation
- Allows draft + published versions to share the same `couponCode`
- Still prevents duplicate `couponCode` across different documents

#### 2. Fixed `beforeUpdate` Immutability Check (lines 155-192)

```javascript
// ✅ AFTER (fixed code)
if (data.couponCode) {
  // In Strapi v5, use documentId or id to properly identify the entry
  const id = where?.documentId || where?.id;

  if (!id) {
    console.warn(
      "[voucher beforeUpdate] No id or documentId found in where clause",
    );
    return;
  }

  const existing = await strapi.db.query("api::voucher.voucher").findOne({
    where: {
      $or: [{ documentId: id }, { id: id }],
    },
  });

  if (existing && existing.couponCode !== data.couponCode) {
    throw new ValidationError(
      "Cannot modify coupon code after creation. Coupon codes are immutable.",
    );
  }
}
```

**What changed:**

- Properly extract `documentId` or `id` from `where` clause
- Use `$or` query to find entry by either `documentId` or `id`
- More robust identification of the entry being updated
- Added error handling for missing identifiers

---

## 🧪 Testing

### Automated Tests

Run the comprehensive test suite:

```bash
npm run strapi -- scripts/test-voucher-lifecycle.js
```

**Tests included:**

1. ✅ Create draft voucher with `couponCode`
2. ✅ Publish draft voucher (should succeed)
3. ✅ Verify draft and published versions coexist
4. ✅ Reject duplicate `couponCode` from different documents
5. ✅ Test `couponCode` immutability
6. ✅ Create and publish new voucher with different code

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

### Manual Testing in Strapi Admin

#### Test Case 1: Basic Draft → Publish Flow

1. **Start Strapi:**

   ```bash
   cd zriadventures-strapi
   npm run develop
   ```

2. **Navigate to Content Manager:**

   - Go to `http://localhost:1337/admin`
   - Click **Content Manager** → **Voucher**

3. **Create Draft Voucher:**
   - Click **"Create new entry"**
   - Set fields:
     - `couponCode`: `MANUAL-TEST-001`
     - `type`: `CASH`
     - `cash.amount`: `10000`
     - `cash.currency`: `LKR`
     - `voucherStatus`: `AVAILABLE`
     - `reusable`: `false`
   - Click **"Save"** (saves as draft)
4. **Verify Draft Saved:**

   - Should show success message
   - Entry appears in list with draft badge

5. **Publish Draft:**

   - Click **"Publish"** button
   - **Expected:** ✅ Success! "Entry published successfully"
   - **Before fix:** ❌ Error: "coupon code exists"

6. **Verify Published:**
   - Entry should show published badge
   - Both draft and published versions exist in database

#### Test Case 2: Duplicate CouponCode Validation

1. **Create Another Voucher:**

   - Click **"Create new entry"**
   - Use same `couponCode`: `MANUAL-TEST-001`
   - Fill other fields
   - Click **"Save"**

2. **Expected Result:**
   - ❌ Error: "Coupon code MANUAL-TEST-001 already exists"
   - Different documents cannot share the same `couponCode`

#### Test Case 3: CouponCode Immutability

1. **Edit Existing Voucher:**

   - Open the published voucher from Test Case 1
   - Try to change `couponCode` to `MANUAL-TEST-002`
   - Click **"Save"**

2. **Expected Result:**
   - ❌ Error: "Cannot modify coupon code after creation. Coupon codes are immutable."

---

## 📊 Summary

### Root Cause (3 key points)

1. **Strapi v5 creates separate rows** for draft and published versions (same `documentId`, different `id`)
2. **Uniqueness check didn't exclude** entries with the same `documentId`
3. **Publishing triggered `beforeCreate`** which found the draft and threw "coupon code exists" error

### The Fix (2 changes)

1. **beforeCreate:** Exclude same `documentId` from uniqueness check → allows draft + published to coexist
2. **beforeUpdate:** Properly identify entries using `documentId` or `id` → correct immutability enforcement

### Verification Steps

1. **Run automated tests:** `npm run strapi -- scripts/test-voucher-lifecycle.js`
2. **Manual test in admin:** Create draft → Publish (should succeed)
3. **Verify uniqueness:** Try creating duplicate couponCode in different document (should fail)

---

## 🎯 Impact

**Before Fix:**

- ❌ Cannot publish draft vouchers
- ❌ Workflow broken for content editors
- ❌ Workaround required (delete draft, create published directly)

**After Fix:**

- ✅ Draft → Publish flow works correctly
- ✅ Uniqueness enforced across documents
- ✅ Immutability enforced correctly
- ✅ Strapi v5 draft/publish semantics respected

---

## 📝 Additional Notes

### Strapi v5 Document Service API

While the current fix uses `strapi.db.query()` (Entity Service), consider migrating to `strapi.documents()` (Document Service API) for better v5 compatibility:

```javascript
// Modern v5 approach
const existing = await strapi.documents("api::voucher.voucher").findMany({
  filters: {
    couponCode: data.couponCode,
    documentId: { $ne: data.documentId },
  },
});
```

### Database Structure

No database migrations required. The fix is purely in the application logic layer. The existing schema and constraints remain unchanged.

### Other Content Types

Review other content types with `draftAndPublish: true` and unique fields to ensure they don't have similar issues. Examples in the codebase:

- Tour (`src/api/tour/content-types/tour/lifecycles.js`)
- Experience (`src/api/experience/content-types/experience/lifecycles.js`)
- Merchandise (`src/api/merchandise/content-types/merchandise/lifecycles.js`)

These already use `where?.id || where?.documentId` patterns in `beforeUpdate` hooks.

---

## ✅ Checklist

- [x] Root cause identified
- [x] Fix implemented in lifecycles.js
- [x] Automated test suite created
- [x] Manual testing steps documented
- [x] Scripts README updated
- [x] No database migrations required
- [x] Strapi v5 semantics respected

---

**Date:** February 9, 2026  
**Strapi Version:** 5.15.1  
**Files Modified:**

- `src/api/voucher/content-types/voucher/lifecycles.js`
- `scripts/test-voucher-lifecycle.js` (new)
- `scripts/README.md` (updated)
