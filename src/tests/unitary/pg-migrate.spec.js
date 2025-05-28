import { expect, jest } from "@jest/globals";

const mockMigrationRunner = {
  default: (options) => {
    mockMigrationRunner.default.options = options;
    return ["any_migration"];
  },
};

jest.unstable_mockModule("node-pg-migrate", () => mockMigrationRunner);

import { resolve } from "node:path";
import MissingParamError from "../../utils/errors/missing-param-error.js";
const PgMigrate = (await import("../../infra/pg-migrate.js")).default;

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new PgMigrate({ postgresAdapter: postgresAdapterSpy });
  return {
    sut,
    postgresAdapterSpy,
  };
};

const makePostgresAdapter = () => {
  const postgresAdapterSpy = {
    async getNewClient() {
      return this.client;
    },
  };

  postgresAdapterSpy.client = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return postgresAdapterSpy;
};

const makePostgresAdapterWithError = () => {
  const postgresAdapterSpy = {
    async getNewClient() {
      throw new Error();
    },
  };

  return postgresAdapterSpy;
};

describe("Pg Migrate", () => {
  test("Should throw if no options are provided", async () => {
    const { sut } = makeSut();
    const promise = sut.up();
    expect(promise).rejects.toThrow(new MissingParamError("options"));
  });

  test("Should call migrationRunner with correct options and dryRun true", async () => {
    const { sut } = makeSut();
    await sut.up({ dryRun: true });
    expect(mockMigrationRunner.default.options).toEqual({
      dir: resolve("src", "infra", "migrations"),
      direction: "up",
      dryRun: true,
      migrationsTable: "pgmigrations",
      log: expect.any(Function),
      dbClient: {
        connect: expect.any(Function),
        query: expect.any(Function),
        end: expect.any(Function),
      },
    });
  });

  test("Should call migrationRunner with correct options and dryRun false", async () => {
    const { sut } = makeSut();
    await sut.up({ dryRun: false });
    expect(mockMigrationRunner.default.options).toEqual({
      dir: resolve("src", "infra", "migrations"),
      direction: "up",
      dryRun: false,
      migrationsTable: "pgmigrations",
      log: expect.any(Function),
      dbClient: {
        connect: expect.any(Function),
        query: expect.any(Function),
        end: expect.any(Function),
      },
    });
  });

  test("Should return an array with the migrations", async () => {
    const { sut } = makeSut();
    const migrations = await sut.up({ dryRun: false });
    expect(migrations).toEqual(["any_migration"]);
  });

  test("Should call dbClient.end()", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    await sut.up({ dryRun: false });
    expect(postgresAdapterSpy.client.end).toHaveBeenCalledTimes(1);
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new PgMigrate(),
      new PgMigrate({}),
      new PgMigrate({
        postgresAdapter: {},
      }),
    ];

    for (const sut of suts) {
      const options = { dryRun: false };
      const promise = sut.up(options);
      expect(promise).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new PgMigrate({
        postgresAdapter: makePostgresAdapterWithError(),
      }),
    ];

    for (const sut of suts) {
      const options = { dryRun: false };
      const promise = sut.up(options);
      expect(promise).rejects.toThrow();
    }
  });
});
