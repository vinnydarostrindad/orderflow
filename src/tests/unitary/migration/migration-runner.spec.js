import MigrationRunner from "../../../infra/migration-runner.js";

const makeSut = () => {
  const pgMigrateSpy = makePgMigrate();
  const sut = new MigrationRunner({
    pgMigrate: pgMigrateSpy,
  });
  return {
    sut,
    pgMigrateSpy,
  };
};

const makePgMigrate = () => {
  const pgMigrateSpy = {
    up({ dryRun } = { dryRun: false }) {
      this.dryRun = dryRun;
      return this.migrations;
    },
  };

  pgMigrateSpy.migrations = ["any_migration"];
  return pgMigrateSpy;
};

const makePgMigrateWithError = () => {
  const pgMigrateSpy = {
    up() {
      throw new Error();
    },
  };

  return pgMigrateSpy;
};

describe("Migration Runner", () => {
  describe("getPendingMigration Method", () => {
    test("Should call pgMigrate.up() with correct values", async () => {
      const { sut, pgMigrateSpy } = makeSut();
      await sut.getPendingMigrations();
      expect(pgMigrateSpy.dryRun).toBe(true);
    });

    test("Should return pending migrations", async () => {
      const { sut } = makeSut();
      const pendingMigrations = await sut.getPendingMigrations();
      expect(pendingMigrations).toEqual(["any_migration"]);
    });

    test("Should throw if invalid dependency is provided in getPendingMigrations", async () => {
      const suts = [
        new MigrationRunner(),
        new MigrationRunner({}),
        new MigrationRunner({
          pgMigrate: {},
        }),
      ];

      for (const sut of suts) {
        expect(sut.getPendingMigrations()).rejects.toThrow(TypeError);
      }
    });

    test("Should throw if any dependency throws in getPendingMigrations", async () => {
      const suts = [
        new MigrationRunner({
          pgMigrate: makePgMigrateWithError(),
        }),
      ];

      for (const sut of suts) {
        expect(sut.getPendingMigrations()).rejects.toThrow();
      }
    });
  });
  describe("postPendingMigration Method", () => {
    test("Should call pgMigrate.up() with correct values", async () => {
      const { sut, pgMigrateSpy } = makeSut();
      await sut.postPendingMigrations();
      expect(pgMigrateSpy.dryRun).toBe(false);
    });

    test("Should return runned migrations", async () => {
      const { sut } = makeSut();
      const pendingMigrations = await sut.postPendingMigrations();
      expect(pendingMigrations).toEqual(["any_migration"]);
    });

    test("Should throw if invalid dependency is provided in postPendingMigrations", async () => {
      const suts = [
        new MigrationRunner(),
        new MigrationRunner({}),
        new MigrationRunner({
          pgMigrate: {},
        }),
      ];

      for (const sut of suts) {
        expect(sut.postPendingMigrations()).rejects.toThrow(TypeError);
      }
    });

    test("Should throw if any dependency throws in postPendingMigrations", async () => {
      const suts = [
        new MigrationRunner({
          pgMigrate: makePgMigrateWithError(),
        }),
      ];

      for (const sut of suts) {
        expect(sut.postPendingMigrations()).rejects.toThrow();
      }
    });
  });
});
