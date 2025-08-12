import MissingParamError from "../../utils/errors/missing-param-error.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

export default class AuthUseCase {
  constructor({ jwt } = {}) {
    this.jwt = jwt;
  }

  generateToken({ employeeId, role, businessId }) {
    if (!employeeId) throw new MissingParamError("employeeId");
    if (!role) throw new MissingParamError("role");
    if (!businessId) throw new MissingParamError("businessId");

    return this.jwt.sign({ employeeId, role, businessId }, process.env.SECRET);
  }
}
