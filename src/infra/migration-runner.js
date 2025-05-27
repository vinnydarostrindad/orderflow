export default class MigrationRunner {
  constructor({ pgMigrate } = {}) {
    this.pgMigrate = pgMigrate;
  }

  async getPendingMigrations() {
    const pendingMigrations = await this.pgMigrate.up({ dryRun: true });
    return pendingMigrations;
  }

  async postPendingMigrations() {
    const runnedMigrations = await this.pgMigrate.up();
    return runnedMigrations;
  }
}

// import { getNewClient } from "./database.js";
// import { resolve } from "node:path";
// import migrationRunner from "node-pg-migrate";

// const defaultMigrationsOptions = {
//   dir: resolve("src", "infra", "migrations"),
//   direction: "up",
//   dryRun: true,
//   log: () => {},
//   migrationsTable: "pgmigrations",
// };

// async function getMigrations() {
//   let dbClient;

//   try {
//     dbClient = await getNewClient();
//     const response = await migrationRunner({
//       ...defaultMigrationsOptions,
//       dbClient: dbClient,
//     });

//     return response;
//   } finally {
//     await dbClient?.end();
//   }
// }

// async function postMigrations() {
//   let dbClient;

//   try {
//     const dbClient = await getNewClient();
//     const response = await migrationRunner({
//       ...defaultMigrationsOptions,
//       dbClient: dbClient,
//       dryRun: false,
//     });

//     return response;
//   } finally {
//     await dbClient?.end();
//   }
// }

// export { getMigrations, postMigrations };
