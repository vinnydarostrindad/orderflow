export default class BaseError extends Error {
  constructor(message, { cause = null, statusCode = 500, action }) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.action = action;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      action: this.action,
    };
  }
}
