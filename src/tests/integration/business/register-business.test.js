import {
  cleanDatabase,
  createBusiness,
  runMigrations,
} from "../orchestrator.js";
import { version as uuidVersion } from "uuid";
import validator from "validator";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/business", () => {
  test("should register a business and return 201 with token", async () => {
    const requestBody = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
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

  test("should return error if name already exists", async () => {
    await createBusiness({
      name: "any_name_1",
      email: "any_email1@mail.com",
      password: "any_password",
    });

    const requestBody = {
      name: "any_name_1",
      email: "any_email2@mail.com",
      password: "any_password",
    };

    const response = await fetch("http://localhost:3000/api/v1/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.json();
    console.log(responseBody);
    expect(response.status).toBe(400);

    expect(responseBody).toEqual({
      name: "ValidationError",
      message: "The name provided is already in use.",
      action: "Use another username to perform this operation.",
      statusCode: 400,
    });
  });
});
