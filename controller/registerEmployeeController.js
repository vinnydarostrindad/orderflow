import registerEmployee from "../use-case/registerEmployee.js";

async function registerEmployeeController(req, res, method) {
  if (method === "POST") {
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

export default registerEmployeeController;
