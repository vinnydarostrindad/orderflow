import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Payment {
  constructor({ id, tableSessionId, method, amount, status } = {}) {
    this.validate(id, tableSessionId, method, amount, status);

    this.id = id;
    this.tableSessionId = tableSessionId;
    this.method = method;
    this.amount = amount;
    this.status = status;
  }

  validate(id, tableSessionId, method, amount, status) {
    if (!id) throw new MissingParamError("id");
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!method) throw new MissingParamError("method");
    if (!amount) throw new MissingParamError("amount");
    if (!status) throw new MissingParamError("status");
  }
}
