export default class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} was not found`);
    this.name = "NotFoundError";
  }
}
