import { query } from "../database.js";

async function businessRepository({ id, name, email, password }) {
  const results = await query({
    text: `
      INSERT INTO
        businesses (id, name, email, password)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        *
    ;`,
    values: [id, name, email, password],
  });

  return results.rows[0];
}

export default businessRepository;
