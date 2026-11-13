import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class CloseTableSessionUseCase {
  constructor({ tableSessionRepository } = {}) {
    this.tableSessionRepository = tableSessionRepository;
  }

  async execute({ tableSessionId } = {}) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");

    const closedSession =
      await this.tableSessionRepository.close(tableSessionId);

    return closedSession;
  }
}
