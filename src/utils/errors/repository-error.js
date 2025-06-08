export default class RepositoryError extends Error {
  constructor(repository) {
    super(`Repository error: ${repository}`);
    this.name = "RepositoryError";
  }
}
