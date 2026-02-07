import MissingParamError from "../../../utils/errors/missing-param-error.js";

class UpdateOrderItemUseCase {
  constructor({ orderItemRepository } = {}) {
    this.orderItemRepository = orderItemRepository;
  }

  async execute({ businessId, orderItemId, status, quantity, notes }) {
    if (!businessId) throw new MissingParamError(businessId);
    if (!orderItemId) throw new MissingParamError(orderItemId);

    const updatedOrderItem = await this.orderItemRepository.update({
      businessId,
      orderItemId,
      status,
      quantity,
      notes,
    });

    return updatedOrderItem;
  }
}

export default UpdateOrderItemUseCase;
