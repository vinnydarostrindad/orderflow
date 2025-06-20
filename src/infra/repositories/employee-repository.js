import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class EmployeeRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, businessId, name, role, hashedPassword } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");
    if (!role) throw new MissingParamError("role");
    if (!hashedPassword) throw new MissingParamError("hashedPassword");

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          employees (id, business_id, name, role, password)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
      values: [id, businessId, name, role, hashedPassword],
    });

    return result.rows[0];
  }

  async findAll(businessId) {
    if (!businessId) throw new MissingParamError("businessId");

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
      values: [businessId],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows;
  }

  async findById(businessId, employeeId) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!employeeId) throw new MissingParamError("employeeId");

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
      values: [employeeId, businessId],
    });

    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }

    return result.rows[0];
  }
}
