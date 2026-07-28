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

async function makeCloseTableSessionTestContext(numberOfTables = 1, props) {
  const business = await createBusiness();
  const { business_id, role, id } = await createEmployee(business.id);
  const token = generateAuthCookie({
    businessId: business_id,
    role,
    employeeId: id,
  });
  const table = await createTable(business.id, numberOfTables, props, token);
  const tableSession = await createTableSession(
    business_id,
    table.id,
    {},
    token,
  );

  return {
    business,
    table,
    tableSession,
    token,
  };
}

describe("PATCH /api/v1/table-session/[tableSessionId]/close", () => {
  test("Should change table session status to closed correctly", async () => {
    const { table, tableSession } = await makeCloseTableSessionTestContext(
      1,
      {},
    );

    const response = await fetch(
      `http://localhost:3000/api/v1/table-sessions/${tableSession.id}/close`,
      {
        method: "PATCH",
      },
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      id: tableSession.id,
      tableId: table.id,
      name: "any_name",
      status: "closed",
    });

    expect(typeof responseBody.id).toBe("string");
    expect(uuidVersion(responseBody.id)).toBe(4);

    expect(typeof responseBody.tableId).toBe("string");
    expect(uuidVersion(responseBody.tableId)).toBe(4);

    expect(typeof responseBody.openedAt).toBe("string");
    expect(Date.parse(responseBody.openedAt)).not.toBeNaN();

    expect(typeof responseBody.closedAt).toBe("string");
    expect(Date.parse(responseBody.closedAt)).not.toBeNaN();
  });
});
