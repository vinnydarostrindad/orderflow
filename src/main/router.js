import BaseError from "../utils/errors/base-error.js";
import MethodNotAllowedError from "../utils/errors/method-not-allowed-error.js";
import NotFoundError from "../utils/errors/not-found-error.js";
import ServerError from "../utils/errors/server-error.js";
import nodeRequestAdapter from "./adapters/node-request-adapter.js";
import { apiRoutes, pagesRoutes } from "./routes/routes.js";

import fsPromises from "node:fs/promises";
import path from "node:path";

const router = async function (req, res) {
  const method = req.method.toLowerCase();
  const url = decodeURIComponent(req.url);

  const mimeTypes = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".html": "text/html",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
  };

  try {
    const pageInfoObj = findMatchingPageRoute(url);
    const urlExt = pageInfoObj ? ".html" : path.extname(url);

    if (urlExt) {
      const filePath = pageInfoObj ? pageInfoObj.filePath : url;
      const encoding = mimeTypes[urlExt].startsWith("image")
        ? undefined
        : { encoding: "utf-8" };

      if (Object.keys(mimeTypes).includes(urlExt)) {
        try {
          const fileContent = await fsPromises.readFile(
            path.join("src/main/pages", filePath),
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
    }

    const { route, params } = findMatchingApiRoute(url, method);

    if (!route) {
      throw new NotFoundError({
        resource: `URL ${url}`,
        action: "Make sure the url exists.",
      });
    }

    const httpRequest = await nodeRequestAdapter(req, params);
    const httpResponse = await route.methods[method](httpRequest);

    if (httpResponse.body instanceof Error) {
      throw httpResponse.body;
    }

    res.writeHead(httpResponse.statusCode, {
      "content-type": "application/json",
    });

    return res.end(JSON.stringify(httpResponse.body));
  } catch (error) {
    console.error(error);

    let finalError = error;

    if (!(error instanceof BaseError)) {
      finalError = new ServerError({ cause: error });
    }

    res.writeHead(finalError.statusCode);
    return res.end(JSON.stringify(finalError));
  }
};

function verifyIfMethodIsAllowed(route, method) {
  if (!route.methods.hasOwnProperty(method)) {
    throw new MethodNotAllowedError(method);
  }
}

function findMatchingPageRoute(url) {
  for (const route of pagesRoutes) {
    const match = url.match(route.pattern);
    if (match) {
      return { filePath: route.filePath, params: match.groups };
    }
  }
  return null;
}

function findMatchingApiRoute(url, method) {
  for (const route of apiRoutes) {
    const match = url.match(route.pattern);
    if (match) {
      verifyIfMethodIsAllowed(route, method);

      return { route, params: match.groups };
    }
  }
  return null;
}

export default router;
