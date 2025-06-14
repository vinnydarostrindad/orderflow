import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetMenuItemUseCase {
  constructor({ orderItemRepository } = {}) {
    this.orderItemRepository = orderItemRepository;
  }

  async execute(orderId, orderItemId) {
    if (!orderId) {
      throw new MissingParamError("orderId");
    }

    if (!orderItemId) {
      const orderItems = await this.orderItemRepository.findAll(orderId);
      if (!orderItems) {
        return null;
      }

      return orderItems;
    }

    const orderItem = await this.orderItemRepository.findById(
      orderId,
      orderItemId,
    );
    if (!orderItem) {
      return null;
    }
    return orderItem;
  }
}
