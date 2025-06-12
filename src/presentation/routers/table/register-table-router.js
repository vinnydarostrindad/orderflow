import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterTableRouter {
  constructor({ registerTableUseCase } = {}) {
    this.registerTableUseCase = registerTableUseCase;
  }

  async route(httpRequest) {
    try {
      const { number, name } = httpRequest.body;
      const { businessId } = httpRequest.params;

      if (!number) {
        return httpResponse.badRequest(new MissingParamError("number"));
      }
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }

      const table = await this.registerTableUseCase.execute({
        number,
        name,
        businessId,
      });
      if (!table) {
        // Melhorar esse error
        return httpResponse.serverError();
      }

      return httpResponse.created(table);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
