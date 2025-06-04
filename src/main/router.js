import migrationRouterComposer from "./composer/migration-router-composer.js";
import registerBusinessRouterComposer from "./composer/register-business-router-composer.js";
import registerEmployeeRouterComposer from "./composer/register-employee-router-composer.js";
import getBusinessRouterComposer from "./composer/get-business-router-composer.js";

const router = async function (req, res) {
  const method = req.method;
  const url = req.url;

  try {
    if (url === "/api/v1/migrations") {
      const httpRequest = {
        method,
      };
      const migrationRouter = migrationRouterComposer.execute();
      const httpResponse = await migrationRouter.route(httpRequest);

      res.writeHead(httpResponse.statusCode, {
        "content-type": "application/json",
      });
      return res.end(JSON.stringify(httpResponse.body));
    }

    if (method === "GET") {
      if (url.startsWith("/api/v1/business")) {
        const match = url.match(/^\/api\/v1\/business\/([^/]+)$/);
        if (match) {
          const id = match[1];
          const httpRequest = {
            body: { id },
          };

          const getBusinessRouter = await getBusinessRouterComposer.execute();
          const httpResponse = await getBusinessRouter.route(httpRequest);
          res.writeHead(httpResponse.statusCode, {
            "content-type": "application/json",
          });
          return res.end(JSON.stringify(httpResponse.body));
        }
      }
    }

    if (method === "POST") {
      if (url === "/api/v1/business") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          const httpRequest = {
            body: JSON.parse(body),
          };
          const registerBusinessRouter =
            registerBusinessRouterComposer.execute();

          const httpResponse = await registerBusinessRouter.route(httpRequest);
          res.writeHead(httpResponse.statusCode, {
            "content-type": "application/json",
          });
          res.end(JSON.stringify(httpResponse.body));
        });

        return;
      }
      if (url === "/api/v1/business/employee") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          const httpRequest = {
            body: JSON.parse(body),
          };
          const registerEmployeeRouter =
            registerEmployeeRouterComposer.execute();

          const httpResponse = await registerEmployeeRouter.route(httpRequest);
          res.writeHead(httpResponse.statusCode, {
            "content-type": "application/json",
          });
          res.end(JSON.stringify(httpResponse.body));
        });

        return;
      }
    }

    res.writeHead(400);
    return res.end();
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.writeHead(500);
    return res.end("Erro interno do servidor");
  }
};

export default router;
