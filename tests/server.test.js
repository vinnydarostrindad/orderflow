import { get } from "node:http";
import { startServer, endServer } from "./orchestrator.js";

const SERVER_URL = "http://localhost:3000";

let serverProcess;

beforeAll(async () => {
  serverProcess = await startServer();
});

afterAll(() => {
  endServer(serverProcess);
});

test("GET / deve retornar 200 e o HTML", (done) => {
  get(SERVER_URL, (res) => {
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);

    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      expect(body).toContain("<!doctype html>");
      done();
    });
  });
});
