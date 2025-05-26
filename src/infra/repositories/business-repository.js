import MissingParamError from "../../utils/errors/missing-param-error";

export default class BusinessRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, name, email, password } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!email) {
      throw new MissingParamError("email");
    }
    if (!password) {
      throw new MissingParamError("password");
    }

    const user = await this.postgresAdapter.query({
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
    if (!user) {
      // Fazer um erro mais específico depois
      return null;
    }
    return user;
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
