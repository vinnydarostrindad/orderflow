import { spawn } from "node:child_process";
import registerBusiness from "../../use-case/businessRegister";

const business = {
  name: "Tapuya",
  email: "tapuya@gmail.com",
  password: "1234",
};
const SERVER_URL = "http://localhost:3000";
let serverProcess;

beforeAll(async () => {
  serverProcess = spawn("node", ["server.js"]);

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Servidor não iniciado"));
    }, 5000);

    serverProcess.stdout.on("data", (buf) => {
      if (buf.toString().includes("Servidor funcionando")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("Erro do servidor:", data.toString());
    });
  });
});

afterAll(() => {
  serverProcess.kill();
});

describe("Business Registration API", () => {
  it("should register a business correctly via API", async () => {
    let response = await fetch(`${SERVER_URL}/api/v1/business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(business),
    });

    let resJSON = await response.json();
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

  it("should throw an error when missing fields", async () => {
    await expect(registerBusiness({ ...business, name: "" })).rejects.toThrow(
      "Preencha todos os campos",
    );
  });
});
