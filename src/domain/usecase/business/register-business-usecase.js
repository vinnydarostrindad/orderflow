import Business from "../../entities/business.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterBusinessUseCase {
  constructor({ crypto, idGenerator, businessRepository } = {}) {
    this.crypto = crypto;
    this.idGenerator = idGenerator;
    this.businessRepository = businessRepository;
  }

  async execute({ name, email, password } = {}) {
    if (!name) throw new MissingParamError("name");
    if (!email) throw new MissingParamError("email");
    if (!password) throw new MissingParamError("password");

    const hashedPassword = await this.crypto.hash(password);

    const id = this.idGenerator.execute();

    const business = new Business({
      id,
      name,
      email,
      hashedPassword,
    });
    const createdBusiness = await this.businessRepository.create(business);

    return createdBusiness;
  }
}
