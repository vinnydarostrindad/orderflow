import { cleanDatabase } from "../orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
});

describe("POST /api/v1/migrations", () => {
  test("should return 201", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
    });
    expect(response.status).toBe(201);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test("should return 200 and an empty array", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
    });
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});
