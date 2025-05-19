import { cleanDatabase, runMigrations } from "./orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("business registration api", () => {
  test("should register a business and return 201", async () => {
    let response = await fetch("http://localhost:3000/api/v1/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "valid_name",
        email: "valid_email@mail.com",
        password: "valid_password",
      }),
    });

    let responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toMatchObject({
      name: "valid_name",
      email: "valid_email@mail.com",
    });
    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(typeof responseBody.password).toBe("string");
    expect(typeof responseBody.created_at).toBe("string");
    expect(typeof responseBody.updated_at).toBe("string");
    expect(responseBody.password).not.toBe("valid_password");
  });
});
