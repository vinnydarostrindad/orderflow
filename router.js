import { readFile as readFileAsync } from "node:fs/promises";
import { join, extname } from "node:path";
import registerBusiness from "./use-case/registerBusiness.js";
import registerEmployee from "./use-case/registerEmployee.js";
import migrationsController from "./controller/migrationsController.js";

const router = async function (req, res) {
  const method = req.method;
  const url = req.url;

  const basePath = join(process.cwd(), "pages");

  try {
    if (url === "/api/v1/migrations") {
      return await migrationsController(req, res, method);
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

    if (method === "POST") {
      if (url === "/api/v1/business") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            let response = await registerBusiness(JSON.parse(body));
            res.writeHead(201, { "content-type": "application/json" });
            return res.end(
              JSON.stringify({
                message: "Empresa registrada com sucesso",
                data: response,
              }),
            );
          } catch (err) {
            console.log(err);
            res.writeHead(400);
            return res.end("Preencha todos os campos corretamente");
          }
        });
      }

      if (url === "/api/v1/business/employee") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            let response = await registerEmployee(JSON.parse(body));
            res.writeHead(201, { "content-type": "application/json" });
            return res.end(
              JSON.stringify({
                message: "Funcionário registrado com sucesso",
                data: response,
              }),
            );
          } catch (err) {
            console.log(err);
            res.writeHead(400);
            return res.end("Preencha todos os campos corretamente");
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.writeHead(500);
    return res.end("Erro interno do servidor");
  }
};

export default router;
