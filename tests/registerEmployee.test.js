import {
  startServer,
  endServer,
  cleanDatabase,
  runMigrations,
} from "./orchestrator.js";

const employee = {
  role: "waiter",
  name: "Vinny",
  password: "vinny1234",
};
const SERVER_URL = "http://localhost:3000";

let serverProcess;

beforeAll(async () => {
  serverProcess = await startServer();
  await cleanDatabase();
  await runMigrations();
});

afterAll(() => {
  endServer(serverProcess);
});

describe("register employee api", () => {
  it("should register a employee correctly via api", async () => {
    const response = await fetch(`${SERVER_URL}/api/v1/business`, {
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

    const response2 = await fetch(`${SERVER_URL}/api/v1/business/employee`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(employee),
    });

    const resJson = await response2.json();
    const data = resJson.data;

    expect(response2.status).toBe(201);
    expect(data).toMatchObject({
      role: employee.role,
      name: employee.name,
    });
    expect(typeof data.id).toBe("string");
    expect(typeof data.business_id).toBe("string");
    expect(typeof data.password).toBe("string");
    expect(typeof data.created_at).toBe("string");
    expect(typeof data.updated_at).toBe("string");
    expect(data.password).not.toBe(employee.password);
  });
});
