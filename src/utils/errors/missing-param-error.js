import BaseError from "./base-error.js";

export default class MissingParamError extends BaseError {
  constructor(paramName) {
    super(`Missing param: ${paramName}`, {
      statusCode: 400,
      action: `Make sure "${paramName}" is not null`,
    });
  }
}
