import { getMigrations, postMigrations } from "../infra/migrations.js";

async function migrationsController(req, res, method) {
  if (method === "GET") {
    const response = await getMigrations();

    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(response));
  }

  if (method === "POST") {
    const response = await postMigrations();

    if (response.length > 0) {
      res.writeHead(201, { "content-type": "application/json" });
    } else {
      res.writeHead(200, { "content-type": "application/json" });
    }

    return res.end(JSON.stringify(response));
  }
}

export default migrationsController;
