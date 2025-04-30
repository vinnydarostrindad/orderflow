import { startServer, endServer } from "./controllServer.js";
import registerEmployee from "../use-case/registerEmployee.js";

const employee = {
  role: "garcom",
  name: "Vinny",
  password: "vinny1234",
};
const SERVER_URL = "http://localhost:3000";

let serverProcess;

beforeAll(async () => {
  serverProcess = await startServer();
});

afterAll(() => {
  endServer(serverProcess);
});

describe("register employee api", () => {
  it("should register a employee correctly via api", async () => {
    const response = await fetch(`${SERVER_URL}/api/v1/business/employee`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(employee),
    });

    const resJson = await response.json();
    const data = resJson.data;

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      role: employee.role,
      name: employee.name,
    });
    expect(typeof data.id).toBe("string");
    // expect(typeof data.business_id).toBe("string");
    expect(typeof data.password).toBe("string");
    expect(typeof data.created_at).toBe("string");
    expect(typeof data.updated_at).toBe("string");
    expect(data.password).not.toBe(employee.password);
  });

  it("should throw an error when missing fields", async () => {
    await expect(registerEmployee({ ...employee, role: "" })).rejects.toThrow(
      "Preencha todos os campos",
    );
  });
});
