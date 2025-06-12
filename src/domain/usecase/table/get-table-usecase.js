import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetTableUseCase {
  constructor({ tableRepository } = {}) {
    this.tableRepository = tableRepository;
  }

  async execute(businessId, tableId) {
    if (!businessId) {
      throw new MissingParamError("businessId");
    }

    if (!tableId) {
      const tables = await this.tableRepository.findAll(businessId);
      if (!tables) {
        return null;
      }

      return tables;
    }

    const table = await this.tableRepository.findById(businessId, tableId);
    if (!table) {
      return null;
    }
    return table;
  }
}
