import MissingParamError from "../../utils/errors/missing-param-error";

export default class RegisterBusinessUseCase {
  constructor({ crypto }) {
    this.crypto = crypto;
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
    await this.crypto.hash(password);
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
