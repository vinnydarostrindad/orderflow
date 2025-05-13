import { cleanDatabase, runMigrations } from "./orchestrator.js";

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
        name: "Tapuya",
        email: "tapuya@gmail.com",
        password: "1234",
      }),
    });

    expect(response.status).toBe(201);

    const response2 = await fetch(
      "http://localhost:3000/api/v1/business/employee",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: "waiter",
          name: "Vinny",
          password: "vinny1234",
        }),
      },
    );

    const resJson = await response2.json();
    const data = resJson.data;

    expect(response2.status).toBe(201);
    expect(data).toMatchObject({
      role: "waiter",
      name: "Vinny",
    });
    expect(typeof data.id).toBe("string");
    expect(typeof data.business_id).toBe("string");
    expect(typeof data.password).toBe("string");
    expect(typeof data.created_at).toBe("string");
    expect(typeof data.updated_at).toBe("string");
    expect(data.password).not.toBe("vinny1234");
  });
});
