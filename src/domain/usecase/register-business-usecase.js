import MissingParamError from "../../utils/errors/missing-param-error";

export default class RegisterBusinessUseCase {
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
