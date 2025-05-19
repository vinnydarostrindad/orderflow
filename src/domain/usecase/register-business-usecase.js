import Business from "../entities/business.js";
import businessRepository from "../../infra/repositories/business-repository.js";

async function registerBusinessUseCase(name, email, password) {
  const business = await Business.create(name, email, password);

  const result = await businessRepository(business);

  return result;
}

export default registerBusinessUseCase;
