module.exports = {
  connection: {
    settings: {
      // Schema sync is allowed to add new columns/tables in prod, but never
      // to silently DROP columns/tables/FKs just because a content-type
      // schema changed. Intentional destructive changes should go through a
      // reviewed file in database/migrations instead.
      forceMigration: false,
    },
  },
};
