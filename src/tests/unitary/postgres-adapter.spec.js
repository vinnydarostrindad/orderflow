import { jest } from "@jest/globals";

jest.unstable_mockModule("pg", () => ({
  Client: class {
    constructor(connectionData) {
      Client.connectionData = connectionData;
      return {
        connect: Client.connect,
        query: Client.query,
        end: Client.end,
      };
    }

    static async connect() {
      Client.connect.isConnected = true;
    }

    static async query(queryObject) {
      Client.query.queryObject = queryObject;
      return "any_result";
    }

    static async end() {
      Client.end.connectionEnded = true;
    }
  },
}));

import MissingParamError from "../../utils/errors/missing-param-error.js";
const sut = (await import("../../infra/adaptors/postgres-adapter.js")).default;
const { Client } = await import("pg");

describe("Postgres Adapter", () => {
  describe("query Method", () => {
    test("Should throw if no queryObject is provided", async () => {
      const promise = sut.query();
      expect(promise).rejects.toThrow(new MissingParamError("queryObject"));
    });

    test("Should call client.query with correct object", async () => {
      const queryObject = {
        text: "any_query",
        values: ["any_value"],
      };
      await sut.query(queryObject);
      expect(Client.query.queryObject).toEqual(queryObject);
    });

    test("Should call client.end correctly", async () => {
      const queryObject = {
        text: "any_query",
        values: ["any_value"],
      };
      await sut.query(queryObject);
      expect(Client.end.connectionEnded).toBe(true);
    });

    test("Should return queryResults correctly", async () => {
      const queryObject = {
        text: "any_query",
        values: ["any_value"],
      };
      const queryResults = await sut.query(queryObject);
      expect(queryResults).toBe("any_result");
    });
  });

  describe("getNewClient Method", () => {
    test("Should call Client with correct data", async () => {
      await sut.getNewClient();
      expect(Client.connectionData).toEqual({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
      });
    });

    test("Should call client.connect correctly", async () => {
      await sut.getNewClient();
      expect(Client.connect.isConnected).toBe(true);
    });

    test("Should return the client already connected", async () => {
      await sut.getNewClient();
      expect(Client.connect.isConnected).toBe(true);
    });
  });
});
