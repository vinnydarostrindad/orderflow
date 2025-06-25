import { expect, jest } from "@jest/globals";
import MigrationRouter from "../../../presentation/routers/migrations/migration-router.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const migrationRunnerSpy = makeMigrationRunner();
  const sut = new MigrationRouter({
    migrationRunner: migrationRunnerSpy,
  });

  return {
    sut,
    migrationRunnerSpy,
  };
};

const makeMigrationRunner = () => {
  class MigrationRunnerSpy {
    async getPendingMigrations() {
      return this.migrations;
    }

    async postPendingMigrations() {
      return this.migrations;
    }
  }

  const migrationRunnerSpy = new MigrationRunnerSpy();
  migrationRunnerSpy.migrations = ["any_migration"];
  return migrationRunnerSpy;
};

const makeMigrationRunnerWithError = () => {
  const migrationRunnerSpy = {
    async getPendingMigrations() {
      throw new Error();
    },
    async postPendingMigrations() {
      throw new Error();
    },
  };

  return migrationRunnerSpy;
};

describe("Migrations Router", () => {
  describe("route Method", () => {
    test("Should throw if no httpRequest is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.route()).rejects.toThrow();
    });

    test("Should 400 if httpRequest has no method", async () => {
      const { sut } = makeSut();
      const httpRequest = {};

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError("method"));
    });

    test("Should return 200 with migrations if method is GET", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        method: "GET",
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual(["any_migration"]);
    });

    test("Should return 201 with migrations if method is POST", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        method: "POST",
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(201);
      expect(httpResponse.body).toEqual(["any_migration"]);
    });

    test("Should throw if invalid dependency is provided", async () => {
      const suts = [
        new MigrationRouter(),
        new MigrationRouter({}),
        new MigrationRouter({
          migrationRunner: {},
        }),
      ];

      const getRequest = {
        method: "GET",
      };
      const postRequest = {
        method: "POST",
      };

      for (const sut of suts) {
        await expect(sut.route(getRequest)).rejects.toThrow();
        await expect(sut.route(postRequest)).rejects.toThrow();
      }
    });

    test("Should throw if any dependency throws", async () => {
      const suts = [
        new MigrationRouter({
          migrationRunner: makeMigrationRunnerWithError(),
        }),
      ];

      for (const sut of suts) {
        const getRequest = {
          method: "GET",
        };
        const postRequest = {
          method: "POST",
        };
        await expect(sut.route(getRequest)).rejects.toThrow();
        await expect(sut.route(postRequest)).rejects.toThrow();
      }
    });
  });

  describe("handleGet Method", () => {
    test("Should call getPendingMigrations correctly and return 200 with migrations", async () => {
      const { sut, migrationRunnerSpy } = makeSut();

      const getSpy = jest.spyOn(migrationRunnerSpy, "getPendingMigrations");
      const httpResponse = await sut.handleGet();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual(["any_migration"]);
    });
  });

  describe("handlePost Method", () => {
    test("Should call postPendingMigrations correctly and return 201 with migrations when migrations exists", async () => {
      const { sut, migrationRunnerSpy } = makeSut();

      const postSpy = jest.spyOn(migrationRunnerSpy, "postPendingMigrations");
      const httpResponse = await sut.handlePost();

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(httpResponse.statusCode).toBe(201);
      expect(httpResponse.body).toEqual(["any_migration"]);
    });

    test("Should call postPendingMigrations correctly and return 200 with empty array when no migrations to apply", async () => {
      const { sut, migrationRunnerSpy } = makeSut();
      migrationRunnerSpy.migrations = [];

      const postSpy = jest.spyOn(migrationRunnerSpy, "postPendingMigrations");
      const httpResponse = await sut.handlePost();

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual([]);
    });
  });
});
