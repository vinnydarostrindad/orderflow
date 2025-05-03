import { Client } from "pg";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const res = await client.query(queryObject);
    console.log(res.rows[0].message);
    return res.rows[0].message;
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
}

async function getNewClient() {
  const client = new Client({
    password: "1234",
    user: "postgres",
  });
  await client.connect();
  return client;
}

export { query };
