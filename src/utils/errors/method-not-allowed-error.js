import BaseError from "./base-error.js";

export default class MethodNotAllowedError extends BaseError {
  constructor(method) {
    super(`${method.toUpperCase()} method is not allowed to this URL.`, {
      action: "Check if the HTTP method sent is valid for this endpoint.",
      statusCode: 405,
    });
  }
}
