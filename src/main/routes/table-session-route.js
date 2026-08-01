import registerTableSessionRouterComposer from "../composer/table_session/register-table-session-router-composer.js";
import closeTableSessionRouterComposer from "../composer/table_session/close-table-session-router-composer.js";
import getOpenTableSessionRouterComposer from "../composer/table_session/get-open-table-session-router-composer.js";

const tableSessionRoute = {
  post: async (httpRequest) => {
    const registerTableSessionRouter =
      registerTableSessionRouterComposer.execute();
    return await registerTableSessionRouter.route(httpRequest);
  },
  getAll: async (httpRequest) => {
    const getOpenTableSessionRouter =
      getOpenTableSessionRouterComposer.execute();
    return await getOpenTableSessionRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getOpenTableSessionRouter =
      getOpenTableSessionRouterComposer.execute();
    return await getOpenTableSessionRouter.route(httpRequest);
  },
  close: async (httpRequest) => {
    const closeTableSessionRouter = closeTableSessionRouterComposer.execute();
    return await closeTableSessionRouter.route(httpRequest);
  },
};

export default tableSessionRoute;
