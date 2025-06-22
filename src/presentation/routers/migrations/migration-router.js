import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class MigrationRouter {
  constructor({ migrationRunner } = {}) {
    this.migrationRunner = migrationRunner;
  }

  async route(httpRequest) {
    const { method } = httpRequest;

    if (!method) {
      return httpResponse.badRequest(new MissingParamError("method"));
    }

    if (method === "GET") return await this.handleGet();
    if (method === "POST") return await this.handlePost();
  }

  async handleGet() {
    const pendingMigrations = await this.migrationRunner.getPendingMigrations();
    return httpResponse.ok(pendingMigrations);
  }

  async handlePost() {
    const runnedMigrations = await this.migrationRunner.postPendingMigrations();
    if (runnedMigrations.length === 0) {
      return httpResponse.ok(runnedMigrations);
    }
    return httpResponse.created(runnedMigrations);
  }
}
