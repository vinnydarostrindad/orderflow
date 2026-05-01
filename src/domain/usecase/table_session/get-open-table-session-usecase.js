import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetOpenTableSessionUseCase {
  constructor({ tableSessionRepository } = {}) {
    this.tableSessionRepository = tableSessionRepository;
  }

  async execute({ tableId } = {}) {
    if (!tableId) throw new MissingParamError("tableId");

    const tableSession =
      await this.tableSessionRepository.findOpenByTableId(tableId);

    return tableSession;
  }
}
