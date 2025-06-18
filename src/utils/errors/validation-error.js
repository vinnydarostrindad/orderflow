import BaseError from "./base-error.js";

export default class ValidationError extends BaseError {
  constructor({ message, action }) {
    super(message, {
      action,
      statusCode: 400,
    });
  }
}
