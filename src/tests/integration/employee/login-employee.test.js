import validator from "validator";
import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createEmployee,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

describe("POST /api/v1/session", () => {
  test("should return 401 if invalid name is provided", async () => {
    const business = await createBusiness();

    const response = await fetch(`http://localhost:3000/api/v1/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        name: "invalid_name",
        role: "manager",
      }),
    });

    const responseBody = await response.json();
    const setCookie = response.headers.getSetCookie();

    expect(response.status).toBe(401);
    expect(setCookie.length).toBe(0);
    expect(responseBody).toEqual({
      name: "InvalidCredentialsError",
      message: "Invalid credentials.",
      action: "Make sure credentials are valid.",
      statusCode: 401,
    });
  });

  test("should return 401 if invalid businessId is provided", async () => {
    const business = await createBusiness();
    const { name, role } = await createEmployee(business.id);

    const response = await fetch(`http://localhost:3000/api/v1/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessId: "c3958a4a-31b3-4cd2-b151-208b03f1823e",
        name,
        role,
      }),
    });

    const responseBody = await response.json();
    const setCookie = response.headers.getSetCookie();

    expect(response.status).toBe(401);
    expect(setCookie.length).toBe(0);
    expect(responseBody).toEqual({
      name: "InvalidCredentialsError",
      message: "Invalid credentials.",
      action: "Make sure credentials are valid.",
      statusCode: 401,
    });
  });

  test("should return 401 if invalid role is provided", async () => {
    const business = await createBusiness();
    const { name, role } = await createEmployee(business.id);
    console.log("ROLE:", role);
    const response = await fetch(`http://localhost:3000/api/v1/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        name,
        role: "manager",
      }),
    });

    const responseBody = await response.json();
    const setCookie = response.headers.getSetCookie();

    expect(response.status).toBe(401);
    expect(setCookie.length).toBe(0);
    expect(responseBody).toEqual({
      name: "InvalidCredentialsError",
      message: "Invalid credentials.",
      action: "Make sure credentials are valid.",
      statusCode: 401,
    });
  });

  test("should return jwt token correctly", async () => {
    const business = await createBusiness();
    const { name, role } = await createEmployee(business.id);

    const response = await fetch(`http://localhost:3000/api/v1/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        name,
        role,
      }),
    });

    const responseBody = await response.json();
    const setCookie = response.headers.getSetCookie()[0];

    expect(response.status).toBe(200);
    expect(setCookie).toContain("token=");
    expect(validator.isJWT(responseBody)).toBeTruthy();
  });
});
