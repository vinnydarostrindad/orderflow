import { cleanDatabase, runMigrations } from "./orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("register employee api", () => {
  it("should register a employee correctly via api", async () => {
    const response = await fetch("http://localhost:3000/api/v1/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      }),
    });

    expect(response.status).toBe(201);

    const response2 = await fetch(
      "http://localhost:3000/api/v1/business/employee",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_id: "00000000-0000-4000-8000-000000000000",
          role: "waiter",
          name: "valid_name",
          password: "valid_password",
        }),
      },
    );

    const responseBody = await response2.json();

    expect(response2.status).toBe(201);
    expect(responseBody).toMatchObject({
      role: "waiter",
      name: "valid_name",
    });
    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(typeof responseBody.business_id).toBe("string");
    expect(typeof responseBody.password).toBe("string");
    expect(typeof responseBody.created_at).toBe("string");
    expect(typeof responseBody.updated_at).toBe("string");
    expect(responseBody.password).not.toBe("valid_password");
  });
});
