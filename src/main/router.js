import DependencyError from "../utils/errors/dependency-error.js";
import MethodNotAllowedError from "../utils/errors/method-not-allowed-error.js";
import NotFoundError from "../utils/errors/not-found-error.js";
import RepositoryError from "../utils/errors/repository-error.js";
import ServerError from "../utils/errors/server-error.js";
import ValidationError from "../utils/errors/validation-error.js";
import nodeRequestAdapter from "./adapters/node-request-adapter.js";
import apiRoutes from "./routes/routes.js";

const router = async function (req, res) {
  const method = req.method.toLowerCase();
  const url = req.url;

  try {
    const { route, params } = findMatchingRoute(url, method);

    if (!route) throw new NotFoundError(`URL ${url}`);

    const httpRequest = await nodeRequestAdapter(req, params);

    const httpResponse = await route.methods[method](httpRequest);

    res.writeHead(httpResponse.statusCode, {
      "content-type": "application/json",
    });

    return res.end(JSON.stringify(httpResponse.body));
  } catch (error) {
    console.error(error);

    if (error instanceof MethodNotAllowedError) {
      res.writeHead(error.statusCode);
      return res.end(JSON.stringify(error));
    } else if (error instanceof NotFoundError) {
      res.writeHead(error.statusCode);
      return res.end(JSON.stringify(error));
    } else if (error instanceof ValidationError) {
      res.writeHead(error.statusCode);
      return res.end(JSON.stringify(error));
    } else if (error instanceof DependencyError) {
      res.writeHead(error.statusCode);
      return res.end(JSON.stringify(error));
    } else if (error instanceof RepositoryError) {
      res.writeHead(error.statusCode);
      return res.end(JSON.stringify(error));
    }

    const serverError = new ServerError({ cause: error });

    res.writeHead(serverError.statusCode);
    return res.end(JSON.stringify(serverError));
  }
};

function verifyIfMethodIsAllowed(route, method) {
  if (method in route.methods) {
    return;
  }
  throw new MethodNotAllowedError(method);
}

function findMatchingRoute(url, method) {
  for (const route of apiRoutes) {
    const match = url.match(route.pattern);
    if (match) {
      verifyIfMethodIsAllowed(route, method);

      return { route, params: match.groups };
    }
  }
  return {};
}

export default router;
