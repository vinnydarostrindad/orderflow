import { Client } from "pg";

import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const res = await client.query(queryObject);
    return res.rows[0].message;
  } catch (err) {
    console.error(err);
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  let client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
  });
  await client.connect();
  return client;
}

export { query };
