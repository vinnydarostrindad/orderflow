import Table from "../../entities/table.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

export default class RegisterTableUseCase {
  constructor({ idGenerator, tableRepository } = {}) {
    this.idGenerator = idGenerator;
    this.tableRepository = tableRepository;
  }

  async execute({ businessId, number, name } = {}) {
    if (!number) {
      throw new MissingParamError("number");
    }
    if (!businessId) {
      throw new MissingParamError("businessId");
    }

    const id = this.idGenerator.execute();
    if (!id) {
      throw new DependencyError("idGenerator");
    }

    const table = new Table({
      id,
      businessId,
      number,
      name,
    });

    const result = await this.tableRepository.create(table);
    if (!result) {
      throw new RepositoryError("table");
    }

    return result;
  }
}
