import GetOrderItemRouter from "../../../presentation/routers/order_item/get-order-item-router.js";
import GetOrderItemUseCase from "../../../domain/usecase/order_item/get-order-item-usecase.js";
import validators from "../../../utils/validator.js";
import OrderItemRepository from "../../../infra/repositories/order-item-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getOrderItemRouterComposer = {
  execute() {
    const orderItemRepository = new OrderItemRepository({ postgresAdapter });
    const getOrderItemUseCase = new GetOrderItemUseCase({
      orderItemRepository,
    });
    const getOrderItemRouter = new GetOrderItemRouter({
      getOrderItemUseCase,
      validators,
    });
    return getOrderItemRouter;
  },
};

export default getOrderItemRouterComposer;
