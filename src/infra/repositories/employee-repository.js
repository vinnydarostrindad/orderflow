import MissingParamError from "../../utils/errors/missing-param-error";

export default class EmployeeRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, business_id, name, email, password } = {}) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!business_id) {
      throw new MissingParamError("business_id");
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

    const employee = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          employee (id, business_id, name, email, password)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
      values: [id, business_id, name, email, password],
    });
    if (!employee) {
      // Fazer um erro mais específico depois
      return null;
    }
    return employee;
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
