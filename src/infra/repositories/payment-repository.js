import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class PaymentRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, tableSessionId, method, amount } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!method) throw new MissingParamError("method");
    if (!amount) throw new MissingParamError("amount");

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          payments (id, table_session_id, method, amount)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      `,
      values: [id, tableSessionId, method, amount],
    });

    return result.rows[0];
  }

  async findById(tableSessionId, paymentId) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!paymentId) throw new MissingParamError("paymentId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          payments
        WHERE
          id = $1 AND table_session_id = $2
        LIMIT
          1
      ;`,
      values: [paymentId, tableSessionId],
    });

    return result.rows[0];
  }

  async findAllByTableSessionId(tableSessionId) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          payments
        WHERE
          table_session_id = $1
      ;`,
      values: [tableSessionId],
    });

    return result.rows;
  }

  async findAllByBusinessId(businessId) {
    if (!businessId) throw new MissingParamError("businessId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          p.*
        FROM
          payments p
        JOIN
          table_sessions ts ON p.table_session_id = ts.id
        JOIN
          tables t ON ts.table_id = t.id
        WHERE
          t.business_id = $1
      ;`,
      values: [businessId],
    });

    return result.rows;
  }

  async deleteById(tableSessionId, paymentId) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!paymentId) throw new MissingParamError("paymentId");

    const result = await this.postgresAdapter.query({
      text: `
        DELETE FROM
          payments
        WHERE
          id = $1 AND table_session_id = $2
        RETURNING
          *
      ;`,
      values: [paymentId, tableSessionId],
    });

    return result.rows[0];
  }
}
