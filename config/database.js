module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("PGHOST", "127.0.0.1"),
      port: env.int("PGPORT", 5432),
      database: env("PGDATABASE", "strapi"),
      user: env("PGUSER", "strapi"),
      password: env("PGPASSWORD", "password"),
      ssl: env.bool("DATABASE_SSL", false),
      // Isolate Strapi environments (prod/dev) when sharing one Postgres instance.
      schema: env("DATABASE_SCHEMA", "public"),
    },
    settings: {
      // Keep explicit to avoid accidental overrides from external config.
      runMigrations: true,
      forceMigration: true,
    },
    pool: { min: 0 },
  },
});
