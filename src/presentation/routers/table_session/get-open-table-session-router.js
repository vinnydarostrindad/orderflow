import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetOpenTableSessionRouter {
  constructor({ getOpenTableSessionUseCase, validators } = {}) {
    this.getOpenTableSessionUseCase = getOpenTableSessionUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableId } = httpRequest.params;

    if (!tableId) {
      const { businessId } = httpRequest.auth || {};

      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }
      if (!this.validators.uuid(businessId)) {
        return httpResponse.badRequest(new InvalidParamError("businessId"));
      }

      const tableSessions = await this.getOpenTableSessionUseCase.execute({
        businessId,
      });

      const editedTableSessions = tableSessions.map((tableSession) => ({
        id: tableSession.id,
        tableId: tableSession.table_id,
        number: tableSession.table_number.toString(),
        name: tableSession.name,
        status: tableSession.status,
        openedAt: tableSession.opened_at,
        closedAt: tableSession.closed_at,
      }));

      return httpResponse.ok(editedTableSessions);
    }
    if (!this.validators.uuid(tableId)) {
      return httpResponse.badRequest(new InvalidParamError("tableId"));
    }

    const tableSession = await this.getOpenTableSessionUseCase.execute({
      tableId,
    });

    if (!tableSession) {
      return httpResponse.notFound(
        "TableSession",
        "Make sure the table session is open.",
      );
    }

    return httpResponse.ok({
      id: tableSession.id,
      tableId: tableSession.table_id,
      name: tableSession.name,
      status: tableSession.status,
      openedAt: tableSession.opened_at,
      closedAt: tableSession.closed_at,
    });
  }
}
