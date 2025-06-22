import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetTableRouter {
  constructor({ getTableUseCase, validators } = {}) {
    this.getTableUseCase = getTableUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { businessId, tableId } = httpRequest.params;

    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }

    if (!tableId) {
      const tables = await this.getTableUseCase.execute(businessId);

      const editedTables = tables.map(
        ({ id, number, name, created_at, updated_at }) => ({
          id,
          businessId,
          number: number.toString(),
          name,
          createdAt: created_at,
          updatedAt: updated_at,
        }),
      );

      return httpResponse.ok(editedTables);
    }

    if (!this.validators.uuid(tableId)) {
      return httpResponse.badRequest(new InvalidParamError("tableId"));
    }

    const table = await this.getTableUseCase.execute(businessId, tableId);

    if (!table) {
      return httpResponse.notFound("Table", "Make sure the table exists.");
    }

    const { number, name, created_at, updated_at } = table;

    return httpResponse.ok({
      businessId,
      id: tableId,
      number: number.toString(),
      name,
      createdAt: created_at,
      updatedAt: updated_at,
    });
  }
}
