import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetOrderItemUseCase {
  constructor({ orderItemRepository } = {}) {
    this.orderItemRepository = orderItemRepository;
  }

  async execute({ businessId, orderId, orderItemId }, period) {
    if (!orderId) {
      if (!businessId) throw new MissingParamError("businessId");

      const orderedItems = await this.orderItemRepository.findAllByBusinessId(
        businessId,
        period,
      );

      return orderedItems;
    }

    if (!orderItemId) {
      const orderItems = await this.orderItemRepository.findAll(orderId);
      return orderItems;
    }

    const orderItem = await this.orderItemRepository.findById(
      orderId,
      orderItemId,
    );

    if (!orderItem) return null;

    return orderItem;
  }
}
