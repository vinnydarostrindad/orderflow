import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetBusinessUseCase {
  constructor({ businessRepository } = {}) {
    this.businessRepository = businessRepository;
  }

  async execute(id) {
    if (!id) throw new MissingParamError("id");

    const business = await this.businessRepository.findById(id);

    return business;
  }
}
