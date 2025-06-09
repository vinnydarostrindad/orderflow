import { jest } from "@jest/globals";
import MigrationRouter from "../../../presentation/routers/migrations/migration-router.js";
import ServerError from "../../../utils/errors/server-error.js";
import MethodNotAllowedError from "../../../utils/errors/method-not-allowed-error.js";

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
    test("Should return 405 if not allowed method is provided", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        method: "not_allowed_method",
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(405);
      expect(httpResponse.body).toEqual(new MethodNotAllowedError());
    });

    test("Should return 500 if no httpRequest is provided", async () => {
      const { sut } = makeSut();
      const httpResponse = await sut.route();
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    });

    test("Should return 500 if httpRequest has no method", async () => {
      const { sut } = makeSut();
      const httpRequest = {};

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
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

    test("Should return 500 if invalid dependency is provided", async () => {
      const suts = [
        new MigrationRouter(),
        new MigrationRouter({}),
        new MigrationRouter({
          migrationRunner: {},
        }),
      ];

      for (const sut of suts) {
        const getRequest = {
          method: "GET",
        };
        const postRequest = {
          method: "POST",
        };
        const getResponse = await sut.route(getRequest);
        const postResponse = await sut.route(postRequest);

        expect(getResponse.statusCode).toBe(500);
        expect(getResponse.body).toEqual(new ServerError());
        expect(postResponse.statusCode).toBe(500);
        expect(postResponse.body).toEqual(new ServerError());
      }
    });

    test("Should return 500 if any dependency throws", async () => {
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
        const getResponse = await sut.route(getRequest);
        const postResponse = await sut.route(postRequest);

        expect(getResponse.statusCode).toBe(500);
        expect(getResponse.body).toEqual(new ServerError());
        expect(postResponse.statusCode).toBe(500);
        expect(postResponse.body).toEqual(new ServerError());
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
