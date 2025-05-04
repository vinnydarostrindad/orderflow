import { Client } from "pg";

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
    user: "postgres",
    password: "local_password",
  });
  await client.connect();
  return client;
}

export { query };
