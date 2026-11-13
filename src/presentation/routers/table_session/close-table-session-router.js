import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class CloseTableSessionRouter {
  constructor({ closeTableSessionUseCase, validators } = {}) {
    this.closeTableSessionUseCase = closeTableSessionUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableSessionId } = httpRequest.params;

    if (!tableSessionId) {
      return httpResponse.badRequest(new MissingParamError("tableSessionId"));
    }
    if (!this.validators.uuid(tableSessionId)) {
      return httpResponse.badRequest(new InvalidParamError("tableSessionId"));
    }

    const closedSession = await this.closeTableSessionUseCase.execute({
      tableSessionId,
    });

    if (!closedSession) {
      return httpResponse.notFound(
        "TableSession",
        "Make sure the session is open.",
      );
    }

    return httpResponse.ok({
      id: closedSession.id,
      tableId: closedSession.table_id,
      name: closedSession.name,
      status: closedSession.status,
      openedAt: closedSession.opened_at,
      closedAt: closedSession.closed_at,
    });
  }
}
