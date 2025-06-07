import getBusinessRouterComposer from "../composer/get-business-router-composer.js";
import registerBusinessRouterComposer from "../composer/register-business-router-composer.js";
import parseBody from "../middlewares/parse-body.js";

const businessRoute = {
  getOne: async (business_id) => {
    const httpRequest = { params: { id: business_id } };

    const getBusinessRouter = getBusinessRouterComposer.execute();
    return await getBusinessRouter.route(httpRequest);
  },
  post: async (req) => {
    const body = await parseBody(req);

    const httpRequest = { body };

    const registerBusinessRouter = registerBusinessRouterComposer.execute();
    return await registerBusinessRouter.route(httpRequest);
  },
};

export default businessRoute;
