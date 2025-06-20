import BaseError from "./base-error.js";

export default class InvalidParamError extends BaseError {
  constructor(paramName) {
    super(`Invalid param: ${paramName}`, {
      statusCode: 400,
      action: `Make sure "${paramName}" has a valid value`,
    });
  }
}
