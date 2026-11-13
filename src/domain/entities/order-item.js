import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class OrderItem {
  constructor({
    id,
    tableSessionId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    this.validate(
      id,
      menuItemId,
      tableSessionId,
      quantity,
      unitPrice,
      totalPrice,
    );

    this.id = id;
    this.tableSessionId = tableSessionId;
    this.menuItemId = menuItemId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
    this.notes = notes;
  }

  validate(id, menuItemId, tableSessionId, quantity, unitPrice, totalPrice) {
    if (!id) throw new MissingParamError("id");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");
  }
}
