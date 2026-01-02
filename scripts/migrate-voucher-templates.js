/**
 * Voucher Template Migration Script
 *
 * Migrates vouchers from JSON voucherTemplate storage to proper relational model.
 *
 * USAGE:
 *   node scripts/migrate-voucher-templates.js
 *
 * WHAT IT DOES:
 *   1. Fetches all vouchers with JSON voucherTemplate field
 *   2. Fetches all available voucher templates
 *   3. Matches JSON data to template by voucherId or name
 *   4. Updates voucher with relational voucherTemplate
 *   5. Logs success/failure for audit trail
 *
 * SAFETY:
 *   - Dry run mode by default (set DRY_RUN=false to apply changes)
 *   - Logs all actions to migration-log.json
 *   - Does not delete old JSON data (backward compatible)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DRY_RUN = process.env.DRY_RUN !== 'false';
const LOG_FILE = path.join(__dirname, 'migration-log.json');

// Initialize Strapi (assumes script runs in Strapi context)
async function runMigration() {
  console.log('🔄 Starting Voucher Template Migration...\n');
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY RUN (no changes applied)' : '⚡ LIVE (will update database)'}\n`);

  const migrationLog = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    results: {
      total: 0,
      matched: 0,
      unmatched: 0,
      errors: 0,
    },
    details: [],
  };

  try {
    // Fetch all vouchers
    console.log('📋 Fetching vouchers...');
    const vouchers = await strapi.documents('api::voucher.voucher').findMany({
      limit: -1, // Get all
    });

    console.log(`Found ${vouchers.length} vouchers\n`);
    migrationLog.results.total = vouchers.length;

    // Fetch all voucher templates
    console.log('📋 Fetching voucher templates...');
    const templates = await strapi.documents('api::voucher-template.voucher-template').findMany({
      limit: -1,
    });

    console.log(`Found ${templates.length} templates\n`);

    // Create lookup map for templates
    const templateMap = new Map();
    templates.forEach(template => {
      // Index by voucherId (UID)
      if (template.voucherId) {
        templateMap.set(template.voucherId, template);
      }
      // Also index by name for fuzzy matching
      if (template.name) {
        templateMap.set(template.name.toLowerCase(), template);
      }
    });

    // Process each voucher
    console.log('🔍 Processing vouchers...\n');

    for (const voucher of vouchers) {
      const logEntry = {
        voucherId: voucher.documentId,
        couponCode: voucher.couponCode,
        status: 'pending',
        oldTemplate: null,
        newTemplateId: null,
        matchMethod: null,
        error: null,
      };

      try {
        // Skip if already has relational template
        if (voucher.voucherTemplate && typeof voucher.voucherTemplate === 'object' && voucher.voucherTemplate.documentId) {
          logEntry.status = 'skipped';
          logEntry.matchMethod = 'already_migrated';
          console.log(`⏭️  Voucher ${voucher.couponCode}: Already has relational template`);
          migrationLog.details.push(logEntry);
          continue;
        }

        // Check if has JSON template data
        const jsonTemplate = voucher.voucherTemplate;
        if (!jsonTemplate || typeof jsonTemplate !== 'object') {
          logEntry.status = 'skipped';
          logEntry.matchMethod = 'no_json_template';
          console.log(`⏭️  Voucher ${voucher.couponCode}: No JSON template to migrate`);
          migrationLog.details.push(logEntry);
          continue;
        }

        logEntry.oldTemplate = jsonTemplate;

        // Try to match template
        let matchedTemplate = null;
        let matchMethod = null;

        // Method 1: Match by voucherId
        if (jsonTemplate.voucherId) {
          matchedTemplate = templateMap.get(jsonTemplate.voucherId);
          if (matchedTemplate) {
            matchMethod = 'by_voucherId';
          }
        }

        // Method 2: Match by name (case-insensitive)
        if (!matchedTemplate && jsonTemplate.name) {
          matchedTemplate = templateMap.get(jsonTemplate.name.toLowerCase());
          if (matchedTemplate) {
            matchMethod = 'by_name';
          }
        }

        // Method 3: Match by image URL (if available)
        if (!matchedTemplate && jsonTemplate.image?.url) {
          const imageUrl = jsonTemplate.image.url;
          matchedTemplate = templates.find(t => t.image?.url === imageUrl);
          if (matchedTemplate) {
            matchMethod = 'by_image_url';
          }
        }

        if (!matchedTemplate) {
          logEntry.status = 'unmatched';
          logEntry.matchMethod = 'no_match_found';
          migrationLog.results.unmatched++;
          console.log(`⚠️  Voucher ${voucher.couponCode}: No matching template found`);
          console.log(`   Old template data: ${JSON.stringify(jsonTemplate)}\n`);
          migrationLog.details.push(logEntry);
          continue;
        }

        logEntry.newTemplateId = matchedTemplate.documentId;
        logEntry.matchMethod = matchMethod;

        // Update voucher with relational template
        if (!DRY_RUN) {
          await strapi.documents('api::voucher.voucher').update({
            documentId: voucher.documentId,
            data: {
              voucherTemplate: matchedTemplate.documentId,
            },
          });
        }

        logEntry.status = 'migrated';
        migrationLog.results.matched++;
        console.log(`✅ Voucher ${voucher.couponCode}: Matched template "${matchedTemplate.name}" (${matchMethod})`);

      } catch (error) {
        logEntry.status = 'error';
        logEntry.error = error.message;
        migrationLog.results.errors++;
        console.error(`❌ Voucher ${voucher.couponCode}: Error - ${error.message}`);
      }

      migrationLog.details.push(logEntry);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total vouchers:     ${migrationLog.results.total}`);
    console.log(`✅ Matched:         ${migrationLog.results.matched}`);
    console.log(`⚠️  Unmatched:       ${migrationLog.results.unmatched}`);
    console.log(`❌ Errors:          ${migrationLog.results.errors}`);
    console.log(`⏭️  Skipped:         ${migrationLog.results.total - migrationLog.results.matched - migrationLog.results.unmatched - migrationLog.results.errors}`);
    console.log('='.repeat(60) + '\n');

    if (DRY_RUN) {
      console.log('🧪 DRY RUN COMPLETE - No changes applied');
      console.log('   To apply changes, run: DRY_RUN=false node scripts/migrate-voucher-templates.js\n');
    } else {
      console.log('⚡ MIGRATION COMPLETE - Database updated\n');
    }

    // Write log file
    fs.writeFileSync(LOG_FILE, JSON.stringify(migrationLog, null, 2));
    console.log(`📝 Migration log saved to: ${LOG_FILE}\n`);

    // Report unmatched vouchers
    if (migrationLog.results.unmatched > 0) {
      console.log('⚠️  MANUAL REVIEW REQUIRED:');
      console.log('   The following vouchers could not be matched automatically:\n');

      migrationLog.details
        .filter(d => d.status === 'unmatched')
        .forEach(d => {
          console.log(`   - Voucher: ${d.couponCode} (ID: ${d.voucherId})`);
          console.log(`     Old template: ${JSON.stringify(d.oldTemplate)}\n`);
        });

      console.log('   Please manually assign templates in Strapi admin.\n');
    }

    return migrationLog;

  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
    migrationLog.results.errors++;
    fs.writeFileSync(LOG_FILE, JSON.stringify(migrationLog, null, 2));
    throw error;
  }
}

// Export for Strapi console or direct execution
module.exports = { runMigration };

// Auto-run if executed directly
if (require.main === module) {
  console.log('⚠️  This script must be run in Strapi context.');
  console.log('   Use: npm run strapi console');
  console.log('   Then: const { runMigration } = require("./scripts/migrate-voucher-templates"); await runMigration();\n');
  process.exit(1);
}
