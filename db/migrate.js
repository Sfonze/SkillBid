// Run with: node db/migrate.js
// Applies db/schema.sql to whatever DATABASE_URL points to. Safe to re-run.
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to your .env file first.");
    process.exit(1);
  }
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : "require",
    onnotice: () => {},
  });
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  console.log("Applying schema.sql to", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));
  await sql.unsafe(schema);
  console.log("Migration complete.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
