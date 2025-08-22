import BaseError from "../utils/errors/base-error.js";
import MethodNotAllowedError from "../utils/errors/method-not-allowed-error.js";
import NotFoundError from "../utils/errors/not-found-error.js";
import ServerError from "../utils/errors/server-error.js";
import nodeRequestAdapter from "./adapters/node-request-adapter.js";
import { apiRoutes, pagesRoutes } from "./routes/routes.js";
import authMiddleware from "./middlewares/authMiddleware.js";

import fsPromises from "node:fs/promises";
import path from "node:path";

const router = async function (req, res) {
  const method = req.method.toLowerCase();
  const url = decodeURIComponent(req.url);

  try {
    const pageInfoObj = findMatchingPageRoute(url);
    const apiRouteInfo = findMatchingApiRoute(url, method);
    let authObj = authMiddleware(req, pageInfoObj || apiRouteInfo);
    if (authObj) {
      if (!authObj.auth && Object.keys(authObj.employeeData).length > 0) {
        const fileContent = await fsPromises.readFile(
          path.join("src/main/pages/reusables/forbidden/index.html"),
          { encoding: "utf-8" },
        );

        res.writeHead(403, { "content-type": "text/html" });
        return res.end(fileContent);
      } else if (!authObj.auth) {
        const fileContent = await fsPromises.readFile(
          path.join("src/main/pages/reusables/unauthorized/index.html"),
          { encoding: "utf-8" },
        );

        res.writeHead(401, { "content-type": "text/html" });
        return res.end(fileContent);
      }
    }

    let response;

    response = await staticFiles(res, url);
    if (response) return response;

    if (pageInfoObj) {
      response = await pageRoute(res, pageInfoObj);
      if (response) return response;
    }

    if (apiRouteInfo) {
      response = await apiRoute(req, res, method, apiRouteInfo, authObj);
      if (response) return response;
    }

    throw new NotFoundError({
      resource: `URL ${url}`,
      action: "Make sure the url exists.",
    });
  } catch (error) {
    console.error(error);

    let finalError = error;

    if (!(error instanceof BaseError)) {
      finalError = new ServerError({ cause: error });
    }

    res.writeHead(finalError.statusCode, {
      "content-type": "application/json",
    });
    return res.end(JSON.stringify(finalError));
  }
};

function findMatchingPageRoute(url) {
  for (const route of pagesRoutes) {
    const match = url.match(route.pattern);
    if (match) {
      return {
        filePath: route.filePath,
        role: route.role,
      };
    }
  }
  return null;
}

function verifyIfMethodIsAllowed(route, method) {
  if (!route.methods.hasOwnProperty(method)) {
    throw new MethodNotAllowedError(method);
  }
}

function findMatchingApiRoute(url, method) {
  for (const route of apiRoutes) {
    const match = url.match(route.pattern);
    if (match) {
      verifyIfMethodIsAllowed(route, method);

      return { route, params: match.groups, role: route.role };
    }
  }
  return null;
}

async function staticFiles(res, url) {
  const mimeTypes = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
  };

  const urlExt = path.extname(url);
  if (!Object.keys(mimeTypes).includes(urlExt)) return null;

  const encoding = mimeTypes[urlExt].startsWith("image")
    ? undefined
    : { encoding: "utf-8" };

  try {
    const fileContent = await fsPromises.readFile(
      path.join("src/main/pages", url),
      encoding,
    );

    res.writeHead(200, { "content-type": mimeTypes[urlExt] });
    return res.end(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("Arquivo não encontrado");
    }

    throw error;
  }
}

async function pageRoute(res, pageInfoObj) {
  if (!pageInfoObj) return null;

  try {
    const fileContent = await fsPromises.readFile(
      path.join("src/main/pages", pageInfoObj.filePath),
      { encoding: "utf-8" },
    );

    res.writeHead(200, { "content-type": "text/html" });
    return res.end(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("Arquivo não encontrado");
    }

    throw error;
  }
}

async function apiRoute(req, res, method, { route, params }, authObj) {
  const httpRequest = await nodeRequestAdapter(req, params, authObj);
  const httpResponse = await route.methods[method](httpRequest);

  if (httpResponse.body instanceof Error) {
    throw httpResponse.body;
  }

  res.writeHead(httpResponse.statusCode, {
    "content-type": "application/json",
    ...httpResponse.headers,
  });

  return res.end(JSON.stringify(httpResponse.body));
}

export default router;
