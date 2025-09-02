import { Client } from "pg";
import MissingParamError from "../../utils/errors/missing-param-error.js";
import RepositoryError from "../../utils/errors/repository-error.js";

import dotenv from "dotenv";

let config;
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development" });
  config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
  };
}
if (process.env.NODE_ENV === "production") {
  config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

export default {
  async query(queryObject) {
    if (!queryObject) throw new MissingParamError("queryObject");

    let client;

    try {
      client = await this.getNewClient();
      const queryResults = await client.query(queryObject);
      return queryResults;
    } catch (error) {
      throw new RepositoryError("Database query failed.", { cause: error });
    } finally {
      await client?.end();
    }
  },

  async getNewClient() {
    try {
      const client = new Client(config);

      await client.connect();
      return client;
    } catch (error) {
      throw new RepositoryError("Failed to connect to database.", {
        cause: error,
      });
    }
  },
};
