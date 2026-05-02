import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterTableSessionRouter {
  constructor({ registerTableSessionUseCase, validators } = {}) {
    this.registerTableSessionUseCase = registerTableSessionUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableId, name } = httpRequest.body;

    if (!tableId)
      return httpResponse.badRequest(new MissingParamError("tableId"));
    if (!this.validators.uuid(tableId))
      return httpResponse.badRequest(new InvalidParamError("tableId"));

    const tableSession = await this.registerTableSessionUseCase.execute({
      tableId,
      name,
    });

    return httpResponse.created({
      id: tableSession.id,
      tableId: tableSession.table_id,
      name: tableSession.name,
      status: tableSession.status,
      openedAt: tableSession.opened_at,
      closedAt: tableSession.closed_at,
    });
  }
}
