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

  async findAll(business_id) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          employees
        WHERE
          business_id = $1
        LIMIT
          10
      ;`,
      values: [business_id],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows;
  }

  async findById(business_id, employee_id) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }
    if (!employee_id) {
      throw new MissingParamError("employee_id");
    }

    const result = await this.postgresAdapter.query({
      text: `
        SELECT 
          * 
        FROM 
          employees
        WHERE 
          id = $1 AND business_id = $2
        LIMIT 
          1
      ;`,
      values: [employee_id, business_id],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows[0];
  }
}
