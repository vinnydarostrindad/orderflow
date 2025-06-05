import migrationRouterComposer from "./composer/migration-router-composer.js";
import registerBusinessRouterComposer from "./composer/register-business-router-composer.js";
import registerEmployeeRouterComposer from "./composer/register-employee-router-composer.js";
import getBusinessRouterComposer from "./composer/get-business-router-composer.js";
import getEmployeeRouterComposer from "./composer/get-employee-router-composer.js";

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
      const matchGetBusiness = url.match(/^\/api\/v1\/business\/([^/]+)$/);
      if (matchGetBusiness) {
        const business_id = matchGetBusiness[1];
        const httpRequest = { params: { id: business_id } };

        const getBusinessRouter = await getBusinessRouterComposer.execute();
        const httpResponse = await getBusinessRouter.route(httpRequest);
        res.writeHead(httpResponse.statusCode, {
          "content-type": "application/json",
        });
        return res.end(JSON.stringify(httpResponse.body));
      }
      const matchGetEmployees = url.match(
        /^\/api\/v1\/business\/([^/]+)\/employee$/,
      );
      if (matchGetEmployees) {
        const business_id = matchGetEmployees[1];
        const httpRequest = { params: { business_id } };

        const getEmployeeRouter = getEmployeeRouterComposer.execute();
        const httpResponse = await getEmployeeRouter.route(httpRequest);
        res.writeHead(httpResponse.statusCode, {
          "content-type": "application/json",
        });
        return res.end(JSON.stringify(httpResponse.body));
      }
      const matchGetEmployee = url.match(
        /^\/api\/v1\/business\/([^/]+)\/employee\/([^/]+)$/,
      );
      if (matchGetEmployee) {
        const business_id = matchGetEmployee[1];
        const employee_id = matchGetEmployee[2];

        const httpRequest = { params: { business_id, employee_id } };

        const getEmployeeRouter = getEmployeeRouterComposer.execute();
        const httpResponse = await getEmployeeRouter.route(httpRequest);
        res.writeHead(httpResponse.statusCode, {
          "content-type": "application/json",
        });
        return res.end(JSON.stringify(httpResponse.body));
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
      const matchPostEmployee = url.match(
        /^\/api\/v1\/business\/([^/]+)\/employee$/,
      );
      if (matchPostEmployee) {
        const business_id = matchPostEmployee[1];

        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          const httpRequest = {
            body: { ...JSON.parse(body), business_id },
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
