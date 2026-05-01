import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetOpenTableSessionRouter {
  constructor({ getOpenTableSessionUseCase, validators } = {}) {
    this.getOpenTableSessionUseCase = getOpenTableSessionUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableId } = httpRequest.query;

    if (!tableId) {
      return httpResponse.badRequest(new MissingParamError("tableId"));
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
        "Make sure the session is open.",
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
