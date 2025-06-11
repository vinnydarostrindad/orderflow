import { cleanDatabase, runMigrations } from "../orchestrator.js";
import { version as uuidVersion } from "uuid";
import validator from "validator";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business", () => {
  test("should register a business and return 201 with token", async () => {
    const requestBody = {
      name: "valid_name",
      email: "valid_email@mail.com",
      password: "valid_password",
    };

    const response = await fetch("http://localhost:3000/api/v1/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(201);

    const { business, token } = responseBody;

    expect(business).toMatchObject({
      id: business.id,
      name: requestBody.name,
      email: requestBody.email,
    });

    expect(typeof business.id).toBe("string");
    expect(uuidVersion(business.id)).toBe(4);

    expect(validator.isEmail(business.email)).toBe(true);

    expect(typeof business.password).toBe("string");
    expect(business.password).not.toBe(requestBody.password);

    expect(typeof business.created_at).toBe("string");
    expect(Date.parse(business.created_at)).not.toBeNaN();

    expect(typeof business.updated_at).toBe("string");
    expect(Date.parse(business.updated_at)).not.toBeNaN();

    expect(validator.isJWT(token)).toBe(true);
  });
});
