import {
  cleanDatabase,
  runMigrations,
  createBusiness,
  createEmployee,
  generateAuthCookie,
} from "./orchestrator.js";

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
      message: "URL /invalid/url was not found.",
      action: "Make sure the url exists.",
      statusCode: 404,
    });
  });

  test("Should return 405 if url not exists with a not accepted method", async () => {
    const response = await fetch("http://localhost:3000/api/v1/business", {
      method: "PATCH",
    });

    expect(response.status).toBe(405);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      name: "MethodNotAllowedError",
      message: "PATCH method is not allowed to this URL.",
      action: "Check if the HTTP method sent is valid for this endpoint.",
      statusCode: 405,
    });
  });

  test("Should return 401 if user is not logged in", async () => {
    const response = await fetch("http://localhost:3000/dashboard");

    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toBe("text/html");
  });

  test("Should return 403 if user is is forbidden from accessing the resource", async () => {
    const business = await createBusiness();
    const employee = await createEmployee(business.id);
    const token = generateAuthCookie({
      businessId: business.id,
      employeeId: employee.id,
      role: employee.role,
    });

    const response = await fetch("http://localhost:3000/dashboard", {
      headers: {
        cookie: `token=${token}`,
      },
    });

    expect(response.status).toBe(403);
    expect(response.headers.get("content-type")).toBe("text/html");
  });
});
