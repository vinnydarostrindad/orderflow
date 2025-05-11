import {
  startServer,
  endServer,
  cleanDatabase,
  runMigrations,
} from "./orchestrator.js";

const business = {
  name: "Tapuya",
  email: "tapuya@gmail.com",
  password: "1234",
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

describe("business registration api", () => {
  it("should register a business correctly via api", async () => {
    let response = await fetch(`${SERVER_URL}/api/v1/business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(business),
    });

    console.log(response);

    let resJSON = await response.json();

    console.log(resJSON);
    let data = resJSON.data;

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      name: business.name,
      email: business.email,
    });
    expect(typeof data.id).toBe("string");
    expect(typeof data.password).toBe("string");
    expect(typeof data.created_at).toBe("string");
    expect(typeof data.updated_at).toBe("string");
    expect(data.password).not.toBe(business.password);
  });
});
