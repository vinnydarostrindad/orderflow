import { Client } from "pg";
import MissingParamError from "../../utils/errors/missing-param-error.js";

import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

export default {
  async query(queryObject) {
    if (!queryObject) {
      throw new MissingParamError("queryObject");
    }

    let client;

    try {
      client = await this.getNewClient();
      const queryResults = await client.query(queryObject);
      return queryResults;
    } catch (err) {
      // Fazer um erro mais específico depois
      console.error(err);
      throw err;
    } finally {
      await client?.end();
    }
  },

  async getNewClient() {
    const client = new Client({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
    });

    await client.connect();
    return client;
  },
};
