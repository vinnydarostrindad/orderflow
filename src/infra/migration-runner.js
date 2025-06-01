export default class MigrationRunner {
  constructor({ pgMigrate } = {}) {
    this.pgMigrate = pgMigrate;
  }

  async getPendingMigrations() {
    const pendingMigrations = await this.pgMigrate.up({ dryRun: true });
    return pendingMigrations;
  }

  async postPendingMigrations() {
    const runnedMigrations = await this.pgMigrate.up({ dryRun: false });
    return runnedMigrations;
  }
}
