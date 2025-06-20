import BaseError from "./base-error.js";

export default class NotFoundError extends BaseError {
  constructor({ resource, action }) {
    super(`${resource} was not found.`, {
      action,
      statusCode: 404,
    });
  }
}
