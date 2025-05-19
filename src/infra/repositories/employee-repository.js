import { query } from "../database.js";

async function employeeRepository({ id, business_id, name, password, role }) {
  const results = await query({
    text: `
      INSERT INTO
        employees (id, business_id, name, password, role)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        *
    ;`,
    values: [id, business_id, name, password, role],
  });

  return results.rows[0];
}

export default employeeRepository;
