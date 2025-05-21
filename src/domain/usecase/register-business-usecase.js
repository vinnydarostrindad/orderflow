import MissingParamError from "../../utils/errors/missing-param-error";

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
    const user = await this.businessRepository.create({
      id,
      name,
      email,
      hashedPassword,
    });
    if (!user) {
      // Fazer um erro mais específico depois
      return null;
    }
    return user;
  }
}

// import Business from "../entities/business.js";
// import businessRepository from "../../infra/repositories/business-repository.js";

// async function registerBusinessUseCase(name, email, password) {
//   const business = await Business.create(name, email, password);

//   const result = await businessRepository(business);

//   return result;
// }

// export default registerBusinessUseCase;
