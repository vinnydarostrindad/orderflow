import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  createTable,
  generateAuthCookie,
  runMigrations,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeRegisterTableSessionTestContext(numberOfTables = 1, props) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const table = await createTable(business.id, numberOfTables, props, token);

  return {
    business,
    table,
    token,
  };
}

describe("POST /api/v1/table-sessions", () => {
  test("Should register a table session and return 201", async () => {
    const { table, token } = await makeRegisterTableSessionTestContext(1, {});
    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify({
          tableId: table.id,
          name: "any_name",
        }),
      },
    );

    expect(response.status).toBe(201);

    const responseBody = await response.json();
    const tableSession = responseBody;

    expect(typeof tableSession.id).toBe("string");
    expect(uuidVersion(tableSession.id)).toBe(4);

    expect(typeof tableSession.tableId).toBe("string");
    expect(uuidVersion(tableSession.tableId)).toBe(4);

    expect(typeof tableSession.openedAt).toBe("string");
    expect(Date.parse(tableSession.openedAt)).not.toBeNaN();

    expect(tableSession.closedAt).toBe(null);
  });

  test("Shuold return Error if table already has a session opened", async () => {
    const { table, token } = await makeRegisterTableSessionTestContext(1, {});
    await fetch(`http://localhost:3000/api/v1/table-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `token=${token}`,
      },
      body: JSON.stringify({
        tableId: table.id,
        name: "any_name_1",
      }),
    });

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify({
          tableId: table.id,
          name: "any_name_2",
        }),
      },
    );

    expect(response.status).toBe(500);
  });
});
