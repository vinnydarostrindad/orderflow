import httpResponse from "../httpResponse.js";

export default class MigrationRouter {
  constructor({ migrationRunner } = {}) {
    this.migrationRunner = migrationRunner;
  }

  async route(httpRequest) {
    try {
      const { method } = httpRequest;

      if (!method) {
        // Arrumar esse throw depois
        throw "Method was not provided";
      }

      if (method === "GET") {
        return await this.handleGet();
      }
      if (method === "POST") {
        return await this.handlePost();
      }

      return httpResponse.methodNotAllowed();
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }

  async handleGet() {
    const pendingMigrations = await this.migrationRunner.getPendingMigrations();
    return httpResponse.ok(pendingMigrations);
  }

  async handlePost() {
    const postedMigrations = await this.migrationRunner.postPendingMigrations();
    if (postedMigrations.length === 0) {
      return httpResponse.ok(postedMigrations);
    }
    return httpResponse.created(postedMigrations);
  }
}

// import { getMigrations, postMigrations } from "../../infra/migrations.js";

// async function migrationsController(req, res, method) {
//   if (method === "GET") {
//     const response = await getMigrations();

//     res.writeHead(200, { "content-type": "application/json" });
//     return res.end(JSON.stringify(response));
//   }

//   if (method === "POST") {
//     const response = await postMigrations();

//     if (response.length > 0) {
//       res.writeHead(201, { "content-type": "application/json" });
//     } else {
//       res.writeHead(200, { "content-type": "application/json" });
//     }

//     return res.end(JSON.stringify(response));
//   }
// }

// export default migrationsController;
