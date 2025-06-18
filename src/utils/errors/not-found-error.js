import BaseError from "./base-error.js";

export default class NotFoundError extends BaseError {
  constructor(resource) {
    super(`${resource} was not found`, {
      action: "Make sure the url exists.",
      statusCode: 404,
    });
  }
}
