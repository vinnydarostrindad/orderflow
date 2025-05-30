import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class EmployeeRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, business_id, name, role, hashedPassword } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!business_id) {
      throw new MissingParamError("business_id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!role) {
      throw new MissingParamError("role");
    }
    if (!hashedPassword) {
      throw new MissingParamError("hashedPassword");
    }

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          employees (id, business_id, name, role, password)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
      values: [id, business_id, name, role, hashedPassword],
    });
    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }
    return result.rows[0];
  }
}

// import { query } from "../database.js";

// async function employeeRepository({ id, business_id, name, password, role }) {
//   const results = await query({
//     text: `
//       INSERT INTO
//         employees (id, business_id, name, password, role)
//       VALUES
//         ($1, $2, $3, $4, $5)
//       RETURNING
//         *
//     ;`,
//     values: [id, business_id, name, password, role],
//   });

//   return results.rows[0];
// }

// export default employeeRepository;
