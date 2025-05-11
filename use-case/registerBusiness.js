import hashPassword from "../utils/hashPassword.js";
import generateID from "../utils/generateID.js";
import { query } from "../infra/database.js";

async function registerBusiness({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Preencha todos os campos");
  }

  const id = generateID();
  const hashedPassword = await hashPassword(password);

  const results = await query({
    text: `
      INSERT INTO
        businesses (id, name, email, password)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        *
    ;`,
    values: [id, name, email, hashedPassword],
  });

  return results.rows[0];
}

export default registerBusiness;
