import { createServer } from "node:http";
import { readFile as readFileAsync } from "node:fs/promises";
import { join, extname } from "node:path";
import registerBusiness from "./use-case/businessRegister.js";

const PORT = 3000;

const serverHandler = async function (req, res) {
  const method = req.method;
  const url = req.url;

  const basePath = join(process.cwd(), "pages");

  try {
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
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.writeHead(500);
    return res.end("Erro interno do servidor");
  }
};

const server = createServer(serverHandler);

server.listen(PORT, () => {
  console.log(`Servidor funcionando em http://localhost:${PORT}`);
});
