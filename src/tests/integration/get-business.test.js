import { version as uuidVersion } from "uuid";
import validator from "validator";
import { cleanDatabase, runMigrations } from "./orchestrator";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("Get Business API", () => {
  test("Should return business correctly", async () => {
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
    const { business } = await response.json();
    const response2 = await fetch(
      `http://localhost:3000/api/v1/business/${business.id}`,
    );

    expect(response2.status).toBe(200);

    const responseBody = await response2.json();

    expect(responseBody).toMatchObject({
      id: business.id,
      name: "any_name",
      email: "any_email@mail.com",
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(validator.isUUID(responseBody.id)).toBe(true);

    expect(validator.isEmail(responseBody.email)).toBe(true);

    expect(typeof responseBody.created_at).toBe("string");
    expect(Date.parse(responseBody.created_at)).not.toBeNaN();

    expect(typeof responseBody.updated_at).toBe("string");
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
  });
});
