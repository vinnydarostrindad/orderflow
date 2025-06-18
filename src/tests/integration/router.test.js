import { cleanDatabase, runMigrations } from "./orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("Router", () => {
  test("Should return 404 if url not exists", async () => {
    const response = await fetch("http://localhost:3000/invalid/url");

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      message: "URL /invalid/url was not found",
      action: "Make sure the url exists.",
      statusCode: 404,
    });
  });
  test("Should return 405 if url not exists with a not accepted method", async () => {
    const response = await fetch("http://localhost:3000/api/v1/business", {
      method: "OPTIONS",
    });

    expect(response.status).toBe(405);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      name: "MethodNotAllowedError",
      message: "OPTIONS method is not allowed to this URL",
      action: "Check if the HTTP method sent is valid for this endpoint.",
      statusCode: 405,
    });
  });
});
