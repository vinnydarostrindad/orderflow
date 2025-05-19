import registerBusinessUseCase from "../domain/usecase/register-business-usecase.js";

async function registerBusinessController(req, res, method) {
  if (method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const { name, email, password } = JSON.parse(body);
      if (!name || !email || !password) {
        throw new Error("Preencha todos os campos");
      }

      try {
        let response = await registerBusinessUseCase(name, email, password);
        res.writeHead(201, { "content-type": "application/json" });
        return res.end(JSON.stringify(response));
      } catch (err) {
        console.log(err);
        res.writeHead(400);
        return res.end("Preencha todos os campos corretamente");
      }
    });
  }
}

export default registerBusinessController;
