import MissingParamError from "../../utils/errors/missing-param-error";
import httpResponse from "../httpResponse";

export default class RegisterEmployeeRouter {
  constructor({ registerEmployeeUseCase } = {}) {
    this.registerEmployeeUseCase = registerEmployeeUseCase;
  }

  async route(httpRequest) {
    try {
      const { business_id, name, role, password } = httpRequest.body;
      if (!business_id) {
        return httpResponse.badRequest(new MissingParamError("business_id"));
      }
      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!role) {
        return httpResponse.badRequest(new MissingParamError("role"));
      }
      if (!password) {
        return httpResponse.badRequest(new MissingParamError("password"));
      }

      const employee = await this.registerEmployeeUseCase.execute({
        business_id,
        name,
        role,
        password,
      });
      if (!employee) {
        // Fazer um erro personalizado
        return httpResponse.serverError();
      }
      return httpResponse.created(employee);
    } catch {
      return httpResponse.serverError();
    }
  }
}

// import registerEmployeeUseCase from "../../domain/usecase/register-employee-usecase.js";
// import { query } from "../../infra/database.js";

// async function registerEmployeeController(req, res, method) {
//   if (method === "POST") {
//     let body = "";

//     req.on("data", (chunk) => {
//       body += chunk.toString();
//     });

//     req.on("end", async () => {
//       const { name, password, role } = JSON.parse(body);
//       if (!name || !password || !role)
//         throw new Error("Preencha todos os campos");

//       try {
//         const businessId = await query({
//           text: `
//             SELECT
//               id
//             FROM
//               businesses
//           ;`,
//         }).then((result) => result.rows[0].id);

//         let response = await registerEmployeeUseCase(
//           businessId,
//           name,
//           password,
//           role,
//         );
//         res.writeHead(201, { "content-type": "application/json" });
//         return res.end(JSON.stringify(response));
//       } catch (err) {
//         console.log(err);
//         res.writeHead(400);
//         return res.end("Preencha todos os campos corretamente");
//       }
//     });
//   }
// }

// export default registerEmployeeController;
