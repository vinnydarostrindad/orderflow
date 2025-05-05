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

describe("GET /api/v1/status", () => {
  it("should return 200", async () => {
    const response = await fetch(`${SERVER_URL}/api/v1/migrations`);
    expect(response.status).toBe(200);

    const resJson = await response.json();
    expect(Array.isArray(resJson)).toBe(true);
    expect(resJson.length).toBeGreaterThan(0);
  });
});
