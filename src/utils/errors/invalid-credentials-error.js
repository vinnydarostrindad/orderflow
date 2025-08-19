import BaseError from "./base-error.js";

class InvalidCredentialsError extends BaseError {
  constructor() {
    super("Invalid credentials.", {
      statusCode: 401,
      action: "Make sure credentials are valid.",
    });
  }
}

export default InvalidCredentialsError;
