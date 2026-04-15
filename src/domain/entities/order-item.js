import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class OrderItem {
  constructor({
    id,
    tableId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    this.validate(id, menuItemId, tableId, quantity, unitPrice, totalPrice);

    this.id = id;
    this.tableId = tableId;
    this.menuItemId = menuItemId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
    this.notes = notes;
  }

  validate(id, menuItemId, tableId, quantity, unitPrice, totalPrice) {
    if (!id) throw new MissingParamError("id");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!tableId) throw new MissingParamError("tableId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");
  }
}
