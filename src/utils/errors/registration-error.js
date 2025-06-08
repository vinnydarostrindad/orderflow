export default class RegistrationError extends Error {
  constructor(entityName) {
    super(`Registration error: ${entityName}`);
    this.name = "RegistrationError";
  }
}
