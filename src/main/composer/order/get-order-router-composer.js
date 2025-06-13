import GetOrderRouter from "../../../presentation/routers/order/get-order-router.js";
import GetOrderUseCase from "../../../domain/usecase/order/get-order-usecase.js";
import OrderRepository from "../../../infra/repositories/order-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getOrderRouterComposer = {
  execute() {
    const orderRepository = new OrderRepository({ postgresAdapter });
    const getOrderUseCase = new GetOrderUseCase({
      orderRepository,
    });
    const getOrderRouter = new GetOrderRouter({
      getOrderUseCase,
    });
    return getOrderRouter;
  },
};

export default getOrderRouterComposer;
