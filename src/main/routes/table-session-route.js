import openTableSessionRouterComposer from "../composer/table_session/open-table-session-router-composer.js";
import closeTableSessionRouterComposer from "../composer/table_session/close-table-session-router-composer.js";
import getOpenTableSessionRouterComposer from "../composer/table_session/get-open-table-session-router-composer.js";

const tableSessionRoute = {
  post: async (httpRequest) => {
    const openTableSessionRouter = openTableSessionRouterComposer.execute();
    return await openTableSessionRouter.route(httpRequest);
  },
  getOpen: async (httpRequest) => {
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
