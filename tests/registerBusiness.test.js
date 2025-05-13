import { cleanDatabase, runMigrations } from "./orchestrator.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("business registration api", () => {
  it("should register a business correctly via api", async () => {
    let response = await fetch("http://localhost:3000/api/v1/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Tapuya",
        email: "tapuya@gmail.com",
        password: "1234",
      }),
    });

    let resJSON = await response.json();
    let data = resJSON.data;

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      name: "Tapuya",
      email: "tapuya@gmail.com",
    });
    expect(typeof data.id).toBe("string");
    expect(typeof data.password).toBe("string");
    expect(typeof data.created_at).toBe("string");
    expect(typeof data.updated_at).toBe("string");
    expect(data.password).not.toBe("1234");
  });
});
