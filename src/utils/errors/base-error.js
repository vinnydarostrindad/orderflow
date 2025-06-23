export default class BaseError extends Error {
  constructor(message, { cause = null, statusCode, action }) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.action = action;
  }

  /* istanbul ignore next */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      action: this.action,
    };
  }
}
