import postgres from "postgres";

let sql;

function getClient() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set. Add it to your .env file.");
    }
    sql = postgres(connectionString, {
      // Most managed Postgres free tiers (Neon, Supabase, etc.) require SSL.
      // `prefer` works against both local dev (no SSL) and hosted SSL-only DBs.
      ssl: connectionString.includes("localhost") ? false : "require",
      max: 5,
    });
  }
  return sql;
}

export const db = getClient();
