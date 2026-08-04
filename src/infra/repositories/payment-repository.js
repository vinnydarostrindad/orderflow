import MissingParamError from "../../utils/errors/missing-param-error";

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
          payments (id, tableSessionId, method, amount)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      `,
      values: [id, tableSessionId, method, amount],
    });

    return result.rows[0];
  }
}
