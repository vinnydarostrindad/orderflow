import MissingParamError from "../../utils/errors/missing-param-error.js";
import ValidationError from "../../utils/errors/validation-error.js";

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

    await this.validateUniqueNameInBusiness(businessId, name);

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          employees (id, business_id, name, role, password)
        VALUES
          ($1, $2, LOWER($3), $4, $5)
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

    return result.rows[0];
  }

  async findByNameAndRole(businessId, name, role) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");
    if (!role) throw new MissingParamError("role");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          employees
        WHERE
          business_id = $1 AND name = LOWER($2) AND role = $3
        LIMIT
          1
      ;`,
      values: [businessId, name, role],
    });

    return result.rows[0];
  }

  async validateUniqueNameInBusiness(businessId, name) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          employees
        WHERE
          business_id = $1 AND name = LOWER($2)
      ;`,
      values: [businessId, name],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "An employee with this name already exists.",
        action: "Use another name to perform this operation.",
      });
    }
  }
}
