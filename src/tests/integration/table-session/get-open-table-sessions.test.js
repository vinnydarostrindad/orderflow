import { version as uuidVersion } from "uuid";
import {
  cleanDatabase,
  createBusiness,
  createEmployee,
  createTable,
  createTableSession,
  generateAuthCookie,
  runMigrations,
} from "../orchestrator.js";

beforeEach(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function makeGetOpenTableSessionsTestContext(numberOfTables = 1, props) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id, 1, {
    role: "waiter",
  });
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });

  const tables = await createTable(business.id, numberOfTables, props, token);

  const tablesList = Array.isArray(tables) ? tables : [tables];
  const tablesSession = await createTableSession(
    business_id,
    tablesList.map((table) => table.id),
    {},
    token,
  );

  return {
    business,
    tables: tablesList,
    tablesSession,
    token,
  };
}

describe("GET /api/v1/table-sessions/[tableId]", () => {
  test("Should return 200 and table session if exists", async () => {
    const { tables, tablesSession } = await makeGetOpenTableSessionsTestContext(
      1,
      {},
    );

    const table = tables[0];
    const tableSession = tablesSession;

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${table.id}`,
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: tableSession.id,
      tableId: table.id,
      name: "any_name",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.tableId).toBe("string");
    expect(uuidVersion(responseBody.tableId)).toBe(4);

    expect(typeof responseBody.openedAt).toBe("string");
    expect(Date.parse(responseBody.openedAt)).not.toBeNaN();

    expect(responseBody.closedAt).toBe(null);
  });

  test("Should return NotFoundError if table session not exists", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/de3d9b50-4635-400b-87a2-21e9bf9f6191`,
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      statusCode: 404,
      action: "Make sure the table session is open.",
      message: "TableSession was not found.",
    });
  });
});

describe("GET /api/v1/table-sessions/open", () => {
  test("Should return all open sessions for the business", async () => {
    const { tables, tablesSession, token } =
      await makeGetOpenTableSessionsTestContext(2, {});

    const response = await fetch(
      "http://localhost:3000/api/v1/table-sessions/open",
      {
        headers: {
          cookie: `token=${token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveLength(2);
    expect(responseBody[0]).toMatchObject({
      id: tablesSession[0].id,
      tableId: tables[0].id,
      number: String(tables[0].number),
      name: "any_name",
      status: "open",
      closedAt: null,
    });
    expect(responseBody[1]).toMatchObject({
      id: tablesSession[1].id,
      tableId: tables[1].id,
      number: String(tables[1].number),
      name: "any_name",
      status: "open",
      closedAt: null,
    });

    for (const tableSession of responseBody) {
      expect(typeof tableSession.id).toBe("string");
      expect(uuidVersion(tableSession.id)).toBe(4);

      expect(typeof tableSession.tableId).toBe("string");
      expect(uuidVersion(tableSession.tableId)).toBe(4);

      expect(typeof tableSession.openedAt).toBe("string");
      expect(Date.parse(tableSession.openedAt)).not.toBeNaN();

      expect(tableSession.closedAt).toBe(null);
    }
  });
});
