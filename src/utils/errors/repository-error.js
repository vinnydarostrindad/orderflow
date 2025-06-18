import BaseError from "./base-error.js";

export default class RepositoryError extends BaseError {
  constructor(repository) {
    super(`Repository error: ${repository}`, {
      statusCode: 400,
      action: "Tende outras credenciais",
    });
  }
}
