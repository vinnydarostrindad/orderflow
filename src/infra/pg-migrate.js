import MissingParamError from "../utils/errors/missing-param-error.js";
import DependencyError from "../utils/errors/dependency-error.js";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

export default class PgMigrate {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  defaultMigrationOptions = {
    dir: resolve("src", "infra", "migrations"),
    direction: "up",
    dryRun: false,
    log: () => {},
    migrationsTable: "pgmigrations",
  };

  async up(options) {
    if (!options) throw new MissingParamError("options");

    let dbClient;
    try {
      dbClient = await this.postgresAdapter.getNewClient();

      const migrations = await migrationRunner({
        ...this.defaultMigrationOptions,
        ...options,
        dbClient: dbClient,
      });
      return migrations;
    } catch (error) {
      throw new DependencyError("node-pg-migrate", {
        message: "Failed to run migration up",
        cause: error,
      });
    } finally {
      dbClient?.end();
    }
  }
}
