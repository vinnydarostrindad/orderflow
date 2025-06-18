import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetTableRouter {
  constructor({ getTableUseCase } = {}) {
    this.getTableUseCase = getTableUseCase;
  }

  async route(httpRequest) {
    try {
      const { businessId, tableId } = httpRequest.params;

      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }

      if (!tableId) {
        const tables = await this.getTableUseCase.execute(businessId);
        if (!tables) {
          return httpResponse.notFound("Table");
        }

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

      const table = await this.getTableUseCase.execute(businessId, tableId);

      if (!table) {
        return httpResponse.notFound("Table");
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
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
