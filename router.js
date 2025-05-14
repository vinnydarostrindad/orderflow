import { readFile as readFileAsync } from "node:fs/promises";
import { join, extname } from "node:path";
import migrationsController from "./controller/migrationsController.js";
import registerBusinessController from "./controller/registerBusinessController.js";
import registerEmployeeController from "./controller/registerEmployeeController.js";

const router = async function (req, res) {
  const method = req.method;
  const url = req.url;

  const basePath = join(process.cwd(), "pages");

  try {
    if (url === "/api/v1/migrations") {
      return await migrationsController(req, res, method);
    }
    if (url === "/api/v1/business") {
      return await registerBusinessController(req, res, method);
    }
    if (url === "/api/v1/business/employee") {
      return await registerEmployeeController(req, res, method);
    }

    if (method === "GET") {
      if (url === "/") {
        const htmlPath = join(basePath, "index.html");
        const content = await readFileAsync(htmlPath);
        res.writeHead(200, { "content-type": "text/html" });
        return res.end(content);
      }

      const ext = extname(url);
      const filePath = join(basePath, url);

      const mimeTypes = {
        ".html": "text/html",
        ".css": "text/css",
      };

      if (mimeTypes[ext]) {
        const content = await readFileAsync(filePath);
        res.writeHead(200, { "content-type": mimeTypes[ext] });
        return res.end(content);
      }

      res.writeHead(404);
      return res.end("Página não encontrada");
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.writeHead(500);
    return res.end("Erro interno do servidor");
  }
};

export default router;
