import MigrationRouter from "../../../presentation/routers/migrations/migration-router.js";
import MigrationRunner from "../../../infra/migration-runner.js";
import PgMigrate from "../../../infra/pg-migrate.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const migrationRouterComposer = {
  execute() {
    const pgMigrate = new PgMigrate({ postgresAdapter });
    const migrationRunner = new MigrationRunner({ pgMigrate });
    const migrationRouter = new MigrationRouter({ migrationRunner });
    return migrationRouter;
  },
};

export default migrationRouterComposer;
