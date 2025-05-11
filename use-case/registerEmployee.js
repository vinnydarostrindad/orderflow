import hashPassword from "../utils/hashPassword.js";
import generateID from "../utils/generateID.js";
import { query } from "../infra/database.js";

async function registerEmployee({ role, name, password }) {
  if (!role || !name || !password) throw new Error("Preencha todos os campos");

  const id = generateID();
  const businessId = await query({
    text: `
      SELECT
        id
      FROM
        businesses
    ;`,
  });
  const hashedPassword = await hashPassword(password).then((derivedKey) =>
    derivedKey.toString("hex"),
  );

  const results = await query({
    text: `
      INSERT INTO
        employees (id, business_id, name, password, role)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        *
    ;`,
    values: [id, businessId.rows[0].id, name, hashedPassword, role],
  });

  return results.rows[0];
}

export default registerEmployee;
