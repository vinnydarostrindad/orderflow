import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetOrderItemUseCase {
  constructor({ orderItemRepository } = {}) {
    this.orderItemRepository = orderItemRepository;
  }

  async execute({ businessId, tableId, orderItemId }, period) {
    if (!tableId) {
      if (!businessId) throw new MissingParamError("businessId");

      const orderedItems = await this.orderItemRepository.findAllByBusinessId(
        businessId,
        period,
      );

      return orderedItems;
    }

    if (!orderItemId) {
      const orderItems = await this.orderItemRepository.findAll(tableId);
      return orderItems;
    }

    const orderItem = await this.orderItemRepository.findById(
      tableId,
      orderItemId,
    );

    if (!orderItem) return null;

    return orderItem;
  }
}
