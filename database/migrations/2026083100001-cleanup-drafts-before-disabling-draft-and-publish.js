"use strict";

/**
 * orders / vouchers / tour_bookings just had draftAndPublish turned off
 * (they're transactional records, not editorial content - see schema.json
 * changes in the same commit). Strapi does not migrate existing rows when
 * that flag flips: any document_id that still has both a draft row
 * (published_at IS NULL) and a published row would otherwise be left as two
 * indistinguishable rows once the draft/published distinction stops being
 * enforced by the app.
 *
 * This only removes a draft row when a published sibling with the same
 * document_id already exists - the published row is the one that reflects
 * real payment/booking state, so it's kept. document_id's that only ever
 * have a draft row (never published) are left untouched, since there's no
 * duplicate to resolve and no safe way to guess intent from here.
 *
 * Idempotent: once no table has a draft+published pair left, every DELETE
 * matches zero rows.
 */

const TABLES = ["orders", "vouchers", "tour_bookings"];

module.exports = {
  async up(knex) {
    for (const table of TABLES) {
      const hasTable = await knex.schema.hasTable(table);
      if (!hasTable) continue;

      const deleted = await knex(`${table} as draft`)
        .whereNull("draft.published_at")
        .whereExists(function () {
          this.select(1)
            .from(`${table} as published`)
            .whereRaw("published.document_id = draft.document_id")
            .whereNotNull("published.published_at");
        })
        .del();

      if (deleted > 0) {
        console.log(
          `[migration] Removed ${deleted} orphaned draft row(s) from ${table} (published counterpart already existed)`
        );
      }
    }
  },

  // Not reversible: the deleted draft rows' data isn't recoverable from the
  // published row (they can differ), so `down` is intentionally a no-op.
  async down() {},
};
