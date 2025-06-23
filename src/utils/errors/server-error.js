import BaseError from "./base-error.js";

/* istanbul ignore next */
export default class ServerError extends BaseError {
  constructor({ cause, statusCode }) {
    super("Internal error", {
      cause,
      statusCode,
      action: "Contact support.",
    });
  }
}
