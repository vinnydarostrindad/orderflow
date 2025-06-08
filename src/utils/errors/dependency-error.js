export default class DependencyError extends Error {
  constructor(dependency) {
    super(`Dependency error: ${dependency}`);
    this.name = "DependencyError";
  }
}
