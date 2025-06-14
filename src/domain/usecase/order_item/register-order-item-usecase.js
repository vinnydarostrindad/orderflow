import OrderItem from "../../entities/order-item.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

export default class RegisterOrderItemUseCase {
  constructor({ idGenerator, orderItemRepository } = {}) {
    this.idGenerator = idGenerator;
    this.orderItemRepository = orderItemRepository;
  }

  async execute({
    orderId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    if (!orderId) throw new MissingParamError("orderId");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");

    const id = this.idGenerator.execute();
    if (!id) throw new DependencyError("idGenerator");

    const orderItem = new OrderItem({
      id,
      orderId,
      menuItemId,
      quantity,
      unitPrice,
      totalPrice,
      notes,
    });

    const result = await this.orderItemRepository.create(orderItem);
    if (!result) throw new RepositoryError("orderItem");

    return result;
  }
}
