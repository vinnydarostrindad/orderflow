import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class RegisterBusinessRouter {
  constructor({ registerBusinessUseCase } = {}) {
    this.registerBusinessUseCase = registerBusinessUseCase;
  }

  route(httpRequest) {
    try {
      const { name, email, password } = httpRequest.body;

      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!email) {
        return httpResponse.badRequest(new MissingParamError("email"));
      }
      if (!password) {
        return httpResponse.badRequest(new MissingParamError("password"));
      }
      const entity = this.registerBusinessUseCase.execute({
        name,
        email,
        password,
      });
      if (!entity) {
        // O Error que irá retornar ainda será definido
        return { statusCode: 400 };
      }
      return httpResponse.created(entity);
    } catch {
      return httpResponse.serverError();
    }
  }
}

// import registerBusinessUseCase from "../domain/usecase/register-business-usecase.js";
//
// async function registerBusinessRouter(req, res, method) {
//   const { name, email, password } = JSON.parse(body);
//   if (!name || !email || !password) {
//     throw new Error("Preencha todos os campos");
//   }

//   try {
//     let response = await registerBusinessUseCase(name, email, password);
//     res.writeHead(201, { "content-type": "application/json" });
//     return res.end(JSON.stringify(response));
//   } catch (err) {
//     console.log(err);
//     res.writeHead(400);
//     return res.end("Preencha todos os campos corretamente");
//   }

// if (method === "POST") {
//   let body = "";

//   req.on("data", (chunk) => {
//     body += chunk.toString();
//   });

//   req.on("end", async () => {
//     const { name, email, password } = JSON.parse(body);
//     if (!name || !email || !password) {
//       throw new Error("Preencha todos os campos");
//     }

//     try {
//       let response = await registerBusinessUseCase(name, email, password);
//       res.writeHead(201, { "content-type": "application/json" });
//       return res.end(JSON.stringify(response));
//     } catch (err) {
//       console.log(err);
//       res.writeHead(400);
//       return res.end("Preencha todos os campos corretamente");
//     }
//   });
// }
// }
