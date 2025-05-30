import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class BusinessRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, name, email, hashedPassword } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!email) {
      throw new MissingParamError("email");
    }
    if (!hashedPassword) {
      throw new MissingParamError("hashedPassword");
    }

    const result = await this.postgresAdapter.query({
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
    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }
    return result.rows[0];
  }
}

// import { query } from "../database.js";

// async function businessRepository({ id, name, email, password }) {
//   const results = await query({
//     text: `
//       INSERT INTO
//         businesses (id, name, email, password)
//       VALUES
//         ($1, $2, $3, $4)
//       RETURNING
//         *
//     ;`,
//     values: [id, name, email, password],
//   });

//   return results.rows[0];
// }

// export default businessRepository;
