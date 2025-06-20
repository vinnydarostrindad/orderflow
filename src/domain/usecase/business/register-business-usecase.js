import Business from "../../entities/business.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterBusinessUseCase {
  constructor({ crypto, idGenerator, businessRepository } = {}) {
    this.crypto = crypto;
    this.idGenerator = idGenerator;
    this.businessRepository = businessRepository;
  }

  async execute({ name, email, password } = {}) {
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!email) {
      throw new MissingParamError("email");
    }
    if (!password) {
      throw new MissingParamError("password");
    }
    const hashedPassword = await this.crypto.hash(password);
    if (!hashedPassword) {
      // Fazer um erro mais específico depois
      return null;
    }
    const id = this.idGenerator.execute();
    if (!id) {
      // Fazer um erro mais específico depois
      return null;
    }

    const business = new Business({
      id,
      name,
      email,
      hashedPassword,
    });
    const result = await this.businessRepository.create(business);
    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }
    return result;
  }
}
