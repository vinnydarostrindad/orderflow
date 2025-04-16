import { spawn } from "node:child_process";
import { get } from "node:http";

let serverProcess;

beforeAll((done) => {
  serverProcess = spawn("node", ["server.js"]);

  const timeout = setTimeout(() => {
    done.fail("Servidor não iniciado");
  }, 5000);

  serverProcess.stdout.on("data", (buf) => {
    if (buf.toString().includes("Servidor funcionando")) {
      done();
      clearInterval(timeout);
    }
  });
});

afterAll((done) => {
  serverProcess.on("exit", () => done());
  serverProcess.kill();
});

test("GET / deve retornar 200 e o HTML", (done) => {
  get("http://127.0.0.1:3000", (res) => {
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
