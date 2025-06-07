import adaptNodeRequest from "./adapters/node-request-adapter.js";
import apiRoutes from "./routes/routes.js";

const router = async function (req, res) {
  const method = req.method;
  const url = req.url;

  try {
    if (method === "GET") {
      for (const route of apiRoutes.get) {
        const match = url.match(route.pattern);
        if (match) {
          const params = match.slice(1);

          const httpRequest = await adaptNodeRequest(req, params);

          const httpResponse = await route.handler(httpRequest);

          res.writeHead(httpResponse.statusCode, {
            "content-type": "application/json",
          });

          return res.end(JSON.stringify(httpResponse.body));
        }
      }
    }

    if (method === "POST") {
      for (const route of apiRoutes.post) {
        const match = url.match(route.pattern);
        if (match) {
          const params = match.slice(1);

          const httpRequest = await adaptNodeRequest(req, params);

          const httpResponse = await route.handler(httpRequest);

          res.writeHead(httpResponse.statusCode, {
            "content-type": "application/json",
          });

          return res.end(JSON.stringify(httpResponse.body));
        }
      }
    }

    // Fazer um erro mais específico depois
    res.writeHead(400);
    return res.end();
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.writeHead(500);
    return res.end("Erro interno do servidor");
  }
};

export default router;
