import MissingParamError from "../../../utils/errors/missing-param-error.js";
import TableSession from "../../entities/table-session.js";

export default class RegisterTableSessionUseCase {
  constructor({ idGenerator, tableSessionRepository } = {}) {
    this.idGenerator = idGenerator;
    this.tableSessionRepository = tableSessionRepository;
  }

  async execute({ tableId, name } = {}) {
    if (!tableId) throw new MissingParamError("tableId");

    const id = this.idGenerator.execute();

    const tableSession = new TableSession({
      id,
      tableId,
      name,
    });

    const createdTableSession =
      await this.tableSessionRepository.create(tableSession);

    return createdTableSession;
  }
}
