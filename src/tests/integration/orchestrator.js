import { query } from "../../infra/database.js";

async function cleanDatabase() {
  await query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runMigrations() {
  await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
}

export { cleanDatabase, runMigrations };
