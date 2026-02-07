import UpdateOrderItemRouter from "../../../presentation/routers/order_item/update-order-item-router.js";
import UpdateOrderItemUseCase from "../../../domain/usecase/order_item/update-order-item-usecase.js";
import validators from "../../../utils/validator.js";
import OrderItemRepository from "../../../infra/repositories/order-item-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const updateOrderItemRouterComposer = {
  execute() {
    const orderItemRepository = new OrderItemRepository({ postgresAdapter });
    const updateOrderItemUseCase = new UpdateOrderItemUseCase({
      orderItemRepository,
    });
    const updateOrderItemRouter = new UpdateOrderItemRouter({
      updateOrderItemUseCase,
      validators,
    });
    return updateOrderItemRouter;
  },
};

export default updateOrderItemRouterComposer;
