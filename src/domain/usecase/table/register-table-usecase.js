import Table from "../../entities/table.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterTableUseCase {
  constructor({ idGenerator, tableRepository } = {}) {
    this.idGenerator = idGenerator;
    this.tableRepository = tableRepository;
  }

  async execute({ businessId, number, name } = {}) {
    if (!number) throw new MissingParamError("number");
    if (!businessId) throw new MissingParamError("businessId");

    const id = this.idGenerator.execute();

    const table = new Table({
      id,
      businessId,
      number,
      name,
    });

    const createdTable = await this.tableRepository.create(table);

    return createdTable;
  }
}
