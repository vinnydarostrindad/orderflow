import registerEmployeeUseCase from "../domain/usecase/register-employee-usecase.js";
import { query } from "../infra/database.js";

async function registerEmployeeController(req, res, method) {
  if (method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const { name, password, role } = JSON.parse(body);
      if (!name || !password || !role)
        throw new Error("Preencha todos os campos");

      try {
        const businessId = await query({
          text: `
            SELECT
              id
            FROM
              businesses
          ;`,
        }).then((result) => result.rows[0].id);

        let response = await registerEmployeeUseCase(
          businessId,
          name,
          password,
          role,
        );
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

export default registerEmployeeController;
