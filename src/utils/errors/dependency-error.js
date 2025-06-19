export default class DependencyError extends Error {
  constructor(dependency, { message, cause, action }) {
    super(`${dependency}: ${message}`, {
      cause,
      statusCode: 500,
      action:
        action ||
        "Check if the external service or library is working properly.",
    });
  }
}
