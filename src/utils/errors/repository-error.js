import BaseError from "./base-error.js";

export default class RepositoryError extends BaseError {
  constructor(message, { cause }) {
    super(message, {
      cause,
      statusCode: 500,
      action: "Try again later or contact support.",
    });
  }
}
