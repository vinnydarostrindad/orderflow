import { startServer, endServer, cleanDatabase } from "../orchestrator.js";

const SERVER_URL = "http://localhost:3000";

let serverProcess;

beforeAll(async () => {
  serverProcess = await startServer();
  await cleanDatabase();
});

afterAll(() => {
  endServer(serverProcess);
});

describe("POST /api/v1/igrations", () => {
  it("should return 201", async () => {
    const response = await fetch(`${SERVER_URL}/api/v1/migrations`, {
      method: "POST",
    });
    expect(response.status).toBe(201);

    const resJson = await response.json();
    expect(Array.isArray(resJson)).toBe(true);
    expect(resJson.length).toBeGreaterThan(0);
  });
  it("should return 200 and an empty array", async () => {
    const response = await fetch(`${SERVER_URL}/api/v1/migrations`, {
      method: "POST",
    });
    expect(response.status).toBe(200);

    const resJson = await response.json();
    expect(Array.isArray(resJson)).toBe(true);
    expect(resJson.length).toBe(0);
  });
});
