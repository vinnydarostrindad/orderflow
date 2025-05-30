// import { readFile as readFileAsync } from "node:fs/promises";
// import { join, extname } from "node:path";
import migrationRouterComposer from "./composer/migration-router-composer.js";
// import registerBusinessRouter from "../presentation/register-business-router.js";
// import registerEmployeeRouter from "../presentation/register-employee-router.js";

const router = async function (req, res) {
  const method = req.method;
  const url = req.url;

  // const basePath = join(process.cwd(), "src/main/pages");

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
    // if (url === "/api/v1/business") {
    //   return await registerBusinessRouter(req, res, method);
    // }
    // if (url === "/api/v1/business/employee") {
    //   return await registerEmployeeRouter(req, res, method);
    // }

    // if (method === "GET") {
    //   if (url === "/") {
    //     const htmlPath = join(basePath, "index.html");
    //     const content = await readFileAsync(htmlPath);
    //     res.writeHead(200, { "content-type": "text/html" });
    //     return res.end(content);
    //   }

    //   const ext = extname(url);
    //   const filePath = join(basePath, url);

    //   const mimeTypes = {
    //     ".html": "text/html",
    //     ".css": "text/css",
    //   };

    //   if (mimeTypes[ext]) {
    //     const content = await readFileAsync(filePath);
    //     res.writeHead(200, { "content-type": mimeTypes[ext] });
    //     return res.end(content);
    //   }

    //   res.writeHead(404);
    //   return res.end("Página não encontrada");
    // }
    res.writeHead(400);
    return res.end();
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.writeHead(500);
    return res.end("Erro interno do servidor");
  }
};

export default router;
